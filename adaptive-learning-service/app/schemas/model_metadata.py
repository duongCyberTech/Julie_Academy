from pydantic import BaseModel

class ModelMetadataUpsert(BaseModel):
  p_init: float
  p_transit: float
  p_slip: float
  p_guess: float