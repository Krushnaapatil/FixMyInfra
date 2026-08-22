from fastapi import FastAPI
from app.routes import detect, verify, duplicate, priority

app = FastAPI(
    title="FixMyInfra AI Service",
    description="CV issue detection, authenticity verification, duplicate detection, priority prediction",
    version="0.1.0",
)

app.include_router(detect.router, prefix="/detect", tags=["issue-detection"])
app.include_router(verify.router, prefix="/verify", tags=["authenticity-verification"])
app.include_router(duplicate.router, prefix="/duplicate-check", tags=["duplicate-detection"])
app.include_router(priority.router, prefix="/priority", tags=["priority-prediction"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}
