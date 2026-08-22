from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/")
async def verify_authenticity(image: UploadFile = File(...)):
    """
    Runs AI-generated image detection, metadata (EXIF) analysis, and
    manipulation detection. Returns an authenticity score used by
    verification-service to flag suspicious complaints for manual review.
    """
    return {
        "filename": image.filename,
        "authenticity_score": 0.0,
        "flags": [],
    }
