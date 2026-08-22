from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/")
async def detect_issue(image: UploadFile = File(...)):
    """
    Runs YOLOv8 on the uploaded image to classify the infrastructure issue
    (pothole, water leakage, broken streetlight, garbage accumulation, etc).
    TODO: load model in app/services/detection_service.py and call it here.
    """
    return {
        "filename": image.filename,
        "detected_category": "TODO",
        "confidence": 0.0,
    }
