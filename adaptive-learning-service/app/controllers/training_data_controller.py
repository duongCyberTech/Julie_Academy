from sqlalchemy.orm import Session
from app.services.training_data_service import TrainingDataService

class TrainingDataController:

  def __init__(self):
    self.service = TrainingDataService()

  def create(self, db: Session, data):
    return self.service.create_training_data(db, data)
