from sqlalchemy import Column, String, Float, DateTime, Enum, Boolean, Integer
from datetime import datetime
from app.core.database import Base

class Sections(Base):
  __tablename__ = "sections"

  skill = Column(String, nullable=False, primary_key=True) # -> category_id
  user_id = Column(String, nullable=False, primary_key=True)
