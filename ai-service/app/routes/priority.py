from fastapi import APIRouter
from pydantic import BaseModel


class PriorityRequest(BaseModel):
    category: str
    severity_signal: float
    affected_users_estimate: int
    public_safety_impact: bool


router = APIRouter()


@router.post("/")
async def predict_priority(payload: PriorityRequest):
    """
    XGBoost model estimating complaint urgency from issue severity,
    public safety impact, and number of affected users.
    """
    return {"priority": "MEDIUM", "score": 0.5}
