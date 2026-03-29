from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Float
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7
import enum

class ModelMetadata(Base):
  __tablename__ = "model_metadata"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))

  p_init = Column(Float, nullable=False)
  p_transit = Column(Float, nullable=False)
  p_slip = Column(Float, nullable=False)
  p_guess = Column(Float, nullable=False)

  accuracy = Column(Float, nullable=False)
  AUC = Column(Float, nullable=True)
  RMSE = Column(Float, nullable=True)

  section_id = Column(String, ForeignKey("sections.id"), nullable=False)
