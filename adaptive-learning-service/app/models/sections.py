from sqlalchemy import Column, String, Float, DateTime, Enum, Boolean, Integer
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7
from app.models.training_data import LevelStatus

class Sections(Base):
  __tablename__ = "sections"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))
  level = Column(Enum(LevelStatus, name="level_status"), nullable=False, default=LevelStatus.EASY)
  skill = Column(String, nullable=False) # -> category_name
  grade = Column(Integer, nullable=False)
  subject = Column(String, nullable=False)
