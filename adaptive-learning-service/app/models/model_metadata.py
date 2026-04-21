from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Float
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7
from app.models.training_data import LevelStatus

class ModelMetadata(Base):
  __tablename__ = "model_metadata"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))
  level = Column(Enum(LevelStatus, name="level_status"), nullable=False, default=LevelStatus.EASY)
  p_init = Column(Float, nullable=False)
  p_transit = Column(Float, nullable=False)
  p_slip = Column(Float, nullable=False)
  p_guess = Column(Float, nullable=False)

  section_id = Column(String, ForeignKey("sections.skill"), nullable=False)
