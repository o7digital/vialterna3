ARG OLIVIA_BASE_IMAGE=olivia-v3-olivia-v3
FROM ${OLIVIA_BASE_IMAGE}
WORKDIR /app
COPY core/app/ app/
COPY demo_api.py app/demo_api.py
COPY knowledge/ knowledge/
COPY tests/ demo_tests/
ENV CHAT_SYSTEM_INSTRUCTIONS_FILE=/app/knowledge/system.md KNOWLEDGE_PATH=/app/knowledge/documents.json PYTHONDONTWRITEBYTECODE=1
EXPOSE 8093
CMD ["uvicorn", "app.demo_api:app", "--host", "0.0.0.0", "--port", "8093", "--workers", "1", "--no-access-log"]
