from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers.training_data_controller import TrainingDataController
from app.schemas.training_data import TrainingDataCreate, TrainingDataResponse
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=TrainingDataResponse)
def create_training_data(
  payload: TrainingDataCreate,
  db: Session = Depends(get_db)
):
  controller = TrainingDataController(db=db)
  return controller.create(db, payload.model_dump())