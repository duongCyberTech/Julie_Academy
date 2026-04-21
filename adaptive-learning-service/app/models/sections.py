from sqlalchemy import Column, String, Float, DateTime, Enum, Boolean, Integer
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7

class Sections(Base):
  __tablename__ = "sections"

  skill = Column(String, nullable=False, unique=True, primary_key=True) # -> category_id
