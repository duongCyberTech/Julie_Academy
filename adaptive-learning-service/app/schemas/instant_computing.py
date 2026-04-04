from pydantic import BaseModel

class QuestionReceiver(BaseModel):
  ques_id: str
  is_correct: bool
  index: int

class InstantComputingParams(BaseModel):
  questions_list: list[QuestionReceiver]

class InstantComputingResponse(BaseModel):
  p_l: float

  def to_dict(self):
    return {"p_l": self.p_l}