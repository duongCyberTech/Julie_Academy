from sqlalchemy.orm import Session
from app.repositories.training_data_repository import TrainingDataRepository

class TrainingDataService:

  def __init__(self):
    self.repo = TrainingDataRepository()

  def create_training_data(self, db: Session, data):
    return self.repo.create(db, data)
