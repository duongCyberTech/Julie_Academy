from datetime import datetime
from pydantic import BaseModel

class TrainingDataCreate(BaseModel):
  user_id: str
  problem_id: str
  correct: bool
  order_id: datetime
  index: int
  section_id: str

class TrainingDataResponse(BaseModel):
  id: str
  problem_id: str
  correct: bool
  order_id: datetime
  index: int
  section_id: str

  class Config:
    from_attributes = True