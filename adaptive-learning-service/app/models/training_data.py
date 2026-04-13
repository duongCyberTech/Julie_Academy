from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7
import enum

class LevelStatus(str, enum.Enum):
  EASY = "easy"
  MEDIUM = "medium"
  HARD = "hard"

class TrainingData(Base):
  __tablename__ = "training_data"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))
  problem_id = Column(String, nullable=False) # -> ques_id
  level = Column(Enum(LevelStatus, name="level_status"), nullable=False, default=LevelStatus.EASY)
  order_id = Column(DateTime, nullable=False, default=datetime.now()) # -> start_at
  correct = Column(Boolean, nullable=False, default=False) # -> is_correct

  section_id = Column(String, ForeignKey("sections.id"), nullable=False)
