from sqlalchemy.orm import Session
from app.services.training_data_service import TrainingDataService

class TrainingDataController:

  def __init__(self, db: Session):
    self.service = TrainingDataService(db=db)

  def create(self, data):
    return self.service.create_training_data(self.db, data)
