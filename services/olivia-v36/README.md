# Olivia v3.6 pour Vialterna3

Extension demandée explicitement pour la démonstration, indépendante du bot de `www.vialterna.com`. Le dossier `core` contient uniquement les modules nécessaires du dépôt Olivia v3, révision et branche enregistrées dans ses fichiers de provenance. `chat_engine.py` ajoute les consignes Vialterna depuis un fichier et désactive la conservation fournisseur des réponses (`store: false`).

## Comportement

Accueil et demande vague : parcours de qualification inspiré de V2. Question précise : réponse générée à partir du contexte V3, avec les derniers échanges de la conversation. Devis, tarifs ou demande explicite de contact : formulaire de mise en relation. Aucun refus global des questions techniques. Aucun outil d'écriture CRM ou système n'est accessible au modèle. Le formulaire commercial existant reste géré par le site.

La base ES/EN contient les 15 pages principales V3. Les articles restent sur le site, sans être ajoutés à ce corpus commercial. Générer le snapshot depuis la racine : `node scripts/build-olivia-knowledge.mjs`. Les faits essentiels et limites figurent dans `knowledge/system.md`. Ne pas qualifier Vialterna de partenaire Starlink ni inventer prix, couverture ou conditions contractuelles.

## Architecture et secrets

Navigateur → `/api/olivia/session` puis `/api/olivia/chat` sur Vercel → service VPS authentifié → PostgreSQL/pgvector et fournisseur IA. Le relais signe les cookies et l'identité du widget, vérifie origine/consentement et impose les identifiants de conversation. L'historique fourni par le navigateur n'est pas utilisé. Le backend impose le tenant `vialterna3-demo`, des limites de débit et de concurrence. Les conversations de cette démonstration sont enregistrées dans sa base dédiée.

Variables Vercel de production : `OLIVIA_V36_GATEWAY_KEY` et `OLIVIA_V36_GATEWAY_URL`. Elles sont serveur uniquement. Sur le VPS : `.env` et `.env.db`, droits 600, jamais versionnés. `.env` contient `DEMO_GATEWAY_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_API_URL`, `OPENAI_MODEL_FAST`, `OPENAI_MODEL_BALANCED`, `OPENAI_MODEL_POWERFUL`, `EMBEDDING_PROVIDER=openai`, `EMBEDDING_MODEL=text-embedding-3-small`, `LOCAL_LLM_ENABLED=false`, `CHAT_TIMEOUT_SECONDS=45`. `.env.db` contient `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Préserver les secrets et le mot de passe de la base lors d'un redéploiement.

## Installation dédiée du 3 novembre 2026

- VPS : alias SSH `o7-vps`, dossier `/opt/o7/apps/vialterna3-olivia36`.
- Compose : projet `vialterna3-olivia36`, API locale `127.0.0.1:8136`, base et volume dédiés. Limites mémoire API 512 Mio, PostgreSQL 256 Mio.
- L'image Olivia existante sert uniquement de base de dépendances ; le code v3.6 et le point d'entrée dédiés sont copiés dans une nouvelle image. Aucun service existant n'est reconstruit.
- Le préfixe HTTPS `/vialterna-demo/` sur `olivia.o7digitalgroup.com` pointe vers la nouvelle API. `install-proxy.py` sauvegarde le fichier, valide Nginx et recharge sa configuration ; les routes existantes sont conservées.
- Santé : `https://olivia.o7digitalgroup.com/vialterna-demo/health` ; le chat nécessite la clé du relais.

Depuis ce dossier sur le VPS : `sudo docker compose -p vialterna3-olivia36 up -d --build`, puis `sudo docker exec vialterna3-olivia36 pytest -q /app/demo_tests`. Les tests utilisent une base SQLite jetable et un moteur simulé, sans appel IA ou lead réel.

Un snapshot identique ne duplique pas les documents au redémarrage. Un snapshot modifié est refusé explicitement pour éviter un mélange silencieux de versions. Pour une évolution ultérieure : sauvegarder la base de démonstration, préparer la migration de ses documents/chunks et embeddings, puis déployer et vérifier le nouveau corpus. Ne jamais vider une base partagée ni intervenir sur V2 pour cette opération.

## Vérification

Tester accueil sans formulaire, questions techniques et suivis, réponses ES/EN, absence de faux statut partenaire Starlink, transfert commercial sur demande et isolation entre sessions. Les tests de formulaire doivent simuler la réponse `/api/olivia-lead`, sans créer de vrai lead. Vérifier aussi l'identité V2 depuis son domaine : elle doit rester accessible.
