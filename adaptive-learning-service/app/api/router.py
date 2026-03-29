# app/api/router.py
from fastapi import APIRouter

from app.api.endpoints.training_data import router as training_router
from app.api.endpoints.health import router as health_router

api_router = APIRouter()

api_router.include_router(
    training_router,
    prefix="/training-data",
    tags=["Training Data"]
)

api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"]
)