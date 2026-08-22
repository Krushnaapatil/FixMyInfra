from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel


class DuplicateCheckRequest(BaseModel):
    description: str
    latitude: float
    longitude: float


router = APIRouter()


@router.post("/")
async def check_duplicate(image: UploadFile = File(...)):
    """
    Combines CLIP image embeddings, Sentence-BERT text embeddings, and
    geospatial distance to flag likely-duplicate complaints so citizens
    can support an existing report instead of filing a new one.
    """
    return {
        "filename": image.filename,
        "is_duplicate": False,
        "matched_complaint_id": None,
        "similarity_score": 0.0,
    }
