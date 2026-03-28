from sqlalchemy import Column, String, Float, DateTime, Enum, Boolean, Integer
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7
import enum

class Sections(Base):
  __tablename__ = "sections"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))
  user_id = Column(String, nullable=False)
  category = Column(String, nullable=False)
  grade = Column(Integer, nullable=False)
  subject = Column(String, nullable=False)
