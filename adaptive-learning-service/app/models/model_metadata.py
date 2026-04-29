from sqlalchemy import Column, ForeignKeyConstraint, String, DateTime, Enum, Boolean, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from uuid6 import uuid7

class ModelMetadata(Base):
  __tablename__ = "model_metadata"

  id = Column(String, primary_key=True, default=lambda: str(uuid7()))
  p_init = Column(Float, nullable=False)
  p_transit = Column(Float, nullable=False)
  p_slip = Column(Float, nullable=False)
  p_guess = Column(Float, nullable=False)
  last_updated_at = Column(DateTime, nullable=False, default=datetime.now())

  section_id = Column(String, nullable=False)
  user_id = Column(String, nullable=False)

  __table_args__ = (
    ForeignKeyConstraint(
      ['section_id', 'user_id'],
      ['sections.skill', 'sections.user_id'],
      onupdate="CASCADE",
      ondelete="CASCADE"
    ),
    UniqueConstraint('section_id', 'user_id', name='_section_meta_uc_')
  )

  section = relationship(
    "Sections",
    primaryjoin="and_(ModelMetadata.section_id == Sections.skill, "
                "ModelMetadata.user_id == Sections.user_id)",
    backref="metadata"
  )
