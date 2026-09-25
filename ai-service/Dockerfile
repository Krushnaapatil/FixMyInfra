# Production image for the FastAPI AI service (CPU torch).
# For GPU hosts, swap the base and install the platform CUDA torch wheel.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv/ai-service
COPY ai-service/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ai-service/app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
