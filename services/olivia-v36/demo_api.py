"""Vialterna demo gateway, using the isolated Olivia 3.6 RAG/chat core."""
import hashlib
import hmac
import json
import os
import re
import threading
import time
import unicodedata
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from .chat_engine import generate
from .db import tenant_session
from .embeddings import get_provider
from .models import Audit, Conversation, Document, DocumentChunk, Message
from .vector_store import PgVectorStore

TENANT = "vialterna3-demo"
provider = get_provider()
store = PgVectorStore()
limits = defaultdict(deque)
limit_lock = threading.Lock()
busy = set()
knowledge_path = Path(os.getenv("KNOWLEDGE_PATH", "/app/knowledge/documents.json"))


def seed_knowledge():
    docs = json.loads(knowledge_path.read_text())
    revision = hashlib.sha256(knowledge_path.read_bytes()).hexdigest()
    with tenant_session(TENANT) as db:
        previous = list(db.scalars(select(Document).where(Document.tenant_id == TENANT)))
        if any(json.loads(doc.metadata_json).get("seed_hash") != revision for doc in previous):
            raise RuntimeError("Knowledge revision changed: use an explicit isolated KB migration")
        existing = {doc.source for doc in previous}
    for doc in docs:
        if doc["source"] in existing:
            continue
        text = doc["content"]
        chunks = [text[i:i+1400] for i in range(0, len(text), 1220) if text[i:i+1400].strip()]
        vectors = provider.embed(chunks)
        with tenant_session(TENANT) as db:
            metadata = json.dumps({**doc["metadata"], "seed_hash": revision})
            row = Document(tenant_id=TENANT, title=doc["title"], content=text, source=doc["source"], metadata_json=metadata)
            db.add(row)
            db.flush()
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                db.add(DocumentChunk(tenant_id=TENANT, document_id=row.id, chunk_index=i, content=chunk, source=doc["source"], metadata_json=metadata, embedding=vector))
            db.commit()


@asynccontextmanager
async def lifespan(app):
    seed_knowledge()
    yield


app = FastAPI(title="Vialterna Olivia v3.6 demo", version="3.6.0", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)


class ChatIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: str = Field(pattern=r"^[a-f0-9]{48}$")
    session_id: str = Field(pattern=r"^[a-f0-9]{32}$")
    client_hash: str = Field(pattern=r"^[a-f0-9]{64}$")
    language: str = Field(default="es", pattern=r"^(es|en|fr)$")
    consent: bool


def normalize(text):
    return " ".join("".join(c for c in unicodedata.normalize("NFKD", text.casefold()) if not unicodedata.combining(c)).split())


def detect_language(message, hint):
    text = normalize(message)
    if re.search(r"\b(bonjour|bonsoir|pourquoi|comment|pouvez|explique|quelle|quelles|combien|que signifie|je voudrais|je veux|en francais)\b", text):
        return "fr"
    if re.search(r"\b(hello|how|what|why|could you|can you|i want|please|in english)\b", text):
        return "en"
    if '¿' in message or re.search(r"\b(hola|buenas|quiero|quisiera|como|cual|que es|que significa|explicame|en espanol)\b", text):
        return "es"
    return hint


def classify(message, prior_phase=""):
    text = normalize(message).strip(" .!?¡¿")
    if re.fullmatch(r"(?:hola|buenas|buenos dias|buenas tardes|buenas noches|hello|hi|hey|bonjour|bonsoir|good morning|good afternoon|good evening)[!,. ]*", text):
        return "greeting"
    commercial_cost = re.search(r"\b(core|edge|cloud|vialterna|your (?:services?|plans?|solutions?))\b.{0,40}\bcost\b", text)
    if commercial_cost or re.search(r"\b(precio|precios|cotiz\w*|presupuesto|pricing|price|quote|quotation|devis|tarif\w*)\b|cuanto cuesta|how much (?:for|is (?:core|edge|cloud|the service|your service))|combien coute|hablar con|hablarle a|talk to|speak to|call me|contact me|llamenme|contactenme|me contacte|parler a|etre rappele|contactez.moi|quiero (?:una? )?auditoria|solicitar (?:una? )?auditoria|request (?:an? )?audit|book (?:an? )?audit", text):
        return "handoff"
    if prior_phase == "handoff_offer" and text in {"si", "yes", "oui", "por favor", "please"}:
        return "handoff"
    if text in {"informacion", "info", "quiero informacion", "quiero mas informacion", "busco informacion", "necesito informacion", "information", "i need information", "informations", "je voudrais des informations"}:
        return "qualification"
    return "answer"


COPY = {
    "es": {
        "greeting": "¡Hola! ¿En qué podemos ayudarle hoy?",
        "qualification": "Con gusto. Podemos orientarle sobre continuidad de sitios, control de proveedores o conexión a la nube. ¿Qué necesita resolver en su operación?",
        "handoff": "Con gusto le canalizamos con un asesor de Vialterna. Las cotizaciones y condiciones específicas las valida el equipo comercial; la auditoría Telco inicial es gratuita y sin compromiso. Complete el formulario para solicitar el seguimiento.",
    },
    "en": {
        "greeting": "Hello! Of course, happy to help. How can we assist you today?",
        "qualification": "Of course. We can help with site continuity, provider management or cloud connectivity. What do you need to solve in your operation?",
        "handoff": "We can put you in touch with a Vialterna advisor. The commercial team validates quotes and specific terms; the initial Telco audit is free with no commitment. Complete the form to request follow-up.",
    },
    "fr": {
        "greeting": "Bonjour ! Bien sûr, avec plaisir. Comment pouvons-nous vous aider aujourd’hui ?",
        "qualification": "Avec plaisir. Nous pouvons vous orienter sur la continuité des sites, la gestion des opérateurs ou la connexion au cloud. Quel problème souhaitez-vous résoudre dans votre activité ?",
        "handoff": "Nous pouvons vous mettre en relation avec un conseiller Vialterna. L’équipe commerciale valide les devis et conditions spécifiques ; l’audit Telco initial est gratuit et sans engagement. Remplissez le formulaire pour demander un suivi.",
    },
}


def authorize(authorization):
    expected = os.getenv("DEMO_GATEWAY_KEY", "")
    if not expected or not hmac.compare_digest(authorization or "", "Bearer " + expected):
        raise HTTPException(401, "Authentication required")


def reserve(body):
    now = time.monotonic()
    with limit_lock:
        # Bound runtime bookkeeping; old, empty buckets are discarded.
        for key in list(limits):
            while limits[key] and limits[key][0] < now - 60:
                limits[key].popleft()
            if not limits[key]:
                del limits[key]
        for key, cap in [("global", 60), ("session:"+body.session_id, 12), ("ip:"+body.client_hash, 24)]:
            if len(limits[key]) >= cap:
                raise HTTPException(429, "Please wait before sending another message")
        if body.conversation_id in busy or len(busy) >= 3:
            raise HTTPException(429, "A reply is already being prepared")
        for key in ["global", "session:"+body.session_id, "ip:"+body.client_hash]:
            limits[key].append(now)
        busy.add(body.conversation_id)


@app.get("/health")
def health():
    return {"status": "ok", "version": "3.6.0", "site": "vialterna3", "knowledge_documents": 15, "provider_configured": bool(os.getenv("OPENAI_API_KEY"))}


@app.post("/chat")
def chat(body: ChatIn, authorization: str | None = Header(None)):
    authorize(authorization)
    if not body.consent:
        raise HTTPException(400, "Consent required")
    reserve(body)
    try:
        language = detect_language(body.message, body.language)
        with tenant_session(TENANT) as db:
            history = list(db.scalars(select(Message).where(Message.tenant_id == TENANT, Message.conversation_id == body.conversation_id).order_by(Message.id.desc()).limit(12)))[::-1]
            phase = classify(body.message)
            engine, model, sources = "conversation-flow", None, []
            if phase in COPY[language]:
                answer = COPY[language][phase]
            else:
                context = store.search(db, TENANT, provider.embed([body.message])[0], body.message, 7, 0.15)
                prompt = f"Visitor language: {language}. Answer in that language.\nVisitor question: {body.message}"
                answer, model, response_id, duration = generate("BALANCED", prompt, history, context, tenant=TENANT)
                engine = "local" if model.startswith("local:") else "openai"
                sources = list(dict.fromkeys(hit.source for hit in context if hit.kind == "document"))
            if not db.get(Conversation, body.conversation_id):
                db.add(Conversation(id=body.conversation_id, tenant_id=TENANT))
                db.flush()
            db.add_all([Message(tenant_id=TENANT, conversation_id=body.conversation_id, role="user", content=body.message), Message(tenant_id=TENANT, conversation_id=body.conversation_id, role="assistant", content=answer)])
            db.add(Audit(tenant_id=TENANT, action="demo.chat", metadata_json=json.dumps({"phase": phase, "engine": engine, "model": model, "conversation_id": body.conversation_id})))
            db.commit()
        handoff = phase == "handoff"
        return {"reply": answer, "version": "3.6.0", "clientCode": TENANT, "language": language, "mode": "olivia-v3.6", "engine": engine, "model": model, "phase": "human_handoff" if handoff else phase, "intent": "handoff" if handoff else "faq", "nextAction": "collect_contact_details" if handoff else "clarify_need" if phase in {"greeting", "qualification"} else "answer_question", "handoffRecommended": handoff, "action": "show_lead_form" if handoff else None, "sources": sources}
    finally:
        with limit_lock:
            busy.discard(body.conversation_id)
