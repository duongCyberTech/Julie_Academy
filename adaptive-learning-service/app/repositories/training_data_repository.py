# app/repositories/training_data_repository.py
from sqlalchemy.orm import Session
from app.models.training_data import TrainingData

class TrainingDataRepository:

  def create(self, db: Session, data: dict):
    obj = TrainingData(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj