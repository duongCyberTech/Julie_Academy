from pydantic import BaseModel
from app.models.training_data import LevelStatus

class ModelMetadataUpsert(BaseModel):
  p_init: float
  p_transit: float
  p_slip: float
  p_guess: float
