from sqlalchemy.orm import Session
from app.repositories.training_data_repository import TrainingDataRepository

class TrainingDataService:

  def __init__(self, db: Session):
    self.repo = TrainingDataRepository(db=db)

  def create_training_data(self, data):
    return self.repo.create(data)
