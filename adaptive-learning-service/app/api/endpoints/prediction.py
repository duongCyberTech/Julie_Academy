from fastapi import APIRouter
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest):
    return await PredictionService().predict(data)