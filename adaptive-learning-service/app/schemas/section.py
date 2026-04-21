from pydantic import BaseModel
from app.models.training_data import LevelStatus

class CreateSectionDto(BaseModel):
  skill: str
