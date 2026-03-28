from pydantic import BaseModel

class TrainingDataCreate(BaseModel):
  ques_id: str
  is_correct: bool
  is_done: bool
  level: str

class TrainingDataResponse(BaseModel):
  id: str
  ques_id: str
  is_correct: bool

  class Config:
    from_attributes = True