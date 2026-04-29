from sqlalchemy import Column, ForeignKeyConstraint, String, DateTime, Enum, Boolean, ForeignKey, Integer
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
  order_id = Column(DateTime, nullable=False, default=datetime.now()) # -> start_at
  correct = Column(Boolean, nullable=False, default=False) # -> is_correct
  index = Column(Integer, nullable=False)

  section_id = Column(String, nullable=False)
  user_id = Column(String, nullable=False)

  __table_args__ = (
    ForeignKeyConstraint(
      ['section_id', 'user_id'],
      ['sections.skill', 'sections.user_id'],
      onupdate="CASCADE",
      ondelete="CASCADE"
    ),
  )