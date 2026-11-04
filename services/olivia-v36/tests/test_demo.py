import os
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['EMBEDDING_PROVIDER'] = 'local-hash'
os.environ['DEMO_GATEWAY_KEY'] = 'test-key-not-a-real-secret'
os.environ['KNOWLEDGE_PATH'] = '/app/knowledge/documents.json'

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from app import db as database
from app import demo_api as demo
from app.models import Base

@pytest.fixture
def client(monkeypatch):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(database, 'engine', engine)
    demo.limits.clear()
    demo.busy.clear()
    with TestClient(demo.app) as test_client:
        yield test_client
    engine.dispose()


def body(message, **kwargs):
    return {'message': message, 'conversation_id': 'a'*48, 'session_id': 'b'*32, 'client_hash': 'c'*64, 'language': 'es', 'consent': True, **kwargs}


def post(client, message, **kwargs):
    return client.post('/chat', json=body(message, **kwargs), headers={'Authorization': 'Bearer test-key-not-a-real-secret'})


def test_auth_and_consent(client):
    assert client.post('/chat', json=body('hola')).status_code == 401
    assert post(client, 'hola', consent=False).status_code == 400
    assert post(client, 'hola', tenant='other-client').status_code == 422


def test_welcome_and_qualification_do_not_collect_contact(client, monkeypatch):
    monkeypatch.setattr(demo, 'generate', lambda *args, **kwargs: pytest.fail('A greeting must not invoke the model'))
    hello = post(client, 'Hola').json()
    assert hello['phase'] == 'greeting' and hello['handoffRecommended'] is False
    info = post(client, 'Quiero información').json()
    assert info['phase'] == 'qualification' and info['action'] is None


def test_specific_question_gets_generated_answer_and_keeps_history(client, monkeypatch):
    histories = []
    def answer(routing, message, history, context, **kwargs):
        histories.append([(item.role, item.content) for item in history])
        assert kwargs['tenant'] == demo.TENANT
        assert all(hit.tenant_id == demo.TENANT for hit in context)
        return 'Bonding combines links; failover switches between them.', 'test-model', 'test-response', 1
    monkeypatch.setattr(demo, 'generate', answer)
    first = post(client, 'Hola, ¿cuál es la diferencia entre bonding y failover?').json()
    assert first['engine'] == 'openai' and first['action'] is None
    assert first['phase'] == 'answer'
    followup = post(client, '¿Y con Starlink?').json()
    assert followup['handoffRecommended'] is False
    assert len(histories[1]) == 2
    assert histories[1][0][1].startswith('Hola, ¿cuál')


def test_explicit_quote_and_advisor_keep_v2_handoff(client, monkeypatch):
    monkeypatch.setattr(demo, 'generate', lambda *args, **kwargs: pytest.fail('Commercial handoff must not invent a quote'))
    for message in ['Quiero una cotización', 'I want to talk to an expert', 'Je voudrais un devis', 'How much does Core cost?']:
        reply = post(client, message).json()
        assert reply['phase'] == 'human_handoff'
        assert reply['action'] == 'show_lead_form'
        assert reply['handoffRecommended'] is True


def test_sla_explanations_are_not_blanket_handoffs(client, monkeypatch):
    monkeypatch.setattr(demo, 'generate', lambda *args, **kwargs: ('Core offers 99.99% SLA in the published offer; contract terms apply.', 'test-model', 'test-response', 1))
    reply = post(client, 'What does the 99.99% Core SLA mean?', language='en').json()
    assert reply['language'] == 'en'
    assert reply['action'] is None
    assert '99.99%' in reply['reply']
    assert post(client, 'How much downtime does a 99.99% SLA allow?', language='en').json()['action'] is None
    assert post(client, 'How is the cost of downtime calculated?', language='en').json()['action'] is None


def test_sessions_do_not_share_history(client, monkeypatch):
    histories = []
    def answer(routing, message, history, context, **kwargs):
        histories.append(list(history))
        return 'Answer', 'test-model', 'test-response', 1
    monkeypatch.setattr(demo, 'generate', answer)
    post(client, 'Explain Cloud')
    post(client, 'Explain Core', conversation_id='d'*48)
    assert histories == [[], []]


def test_knowledge_is_scoped_and_complete(client):
    with database.tenant_session(demo.TENANT) as db:
        docs = list(db.scalars(demo.select(demo.Document).where(demo.Document.tenant_id == demo.TENANT)))
        assert len(docs) == 15
        assert all(doc.source.startswith('https://vialterna3.vercel.app/') for doc in docs)
        assert any('99.99%' in doc.content and 'Core' in doc.content for doc in docs)
    demo.seed_knowledge()  # Re-deploying an identical snapshot must not duplicate documents.
    with database.tenant_session(demo.TENANT) as db:
        assert len(list(db.scalars(demo.select(demo.Document)))) == 15


def test_rate_limit(client):
    for _ in range(12):
        assert post(client, 'Hola').status_code == 200
    assert post(client, 'Hola').status_code == 429
