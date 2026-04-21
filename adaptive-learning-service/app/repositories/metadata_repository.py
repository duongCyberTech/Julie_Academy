from sqlalchemy.orm import Session
from sqlalchemy import update
from app.models.model_metadata import ModelMetadata
from app.models.training_data import LevelStatus
from app.models.sections import Sections

class MetadataRepository:
  def __init__(self, db: Session):
    self.db = db

  def create(self):
    pass

  def get_many(self):
    pass

  def get_by_section(self, section_id: str):
    pass

  def get_by_id(self, id: str):
    pass

  def update_by_skill_and_level(self, skill: str, updated_data: dict):
    section = self.db.query(Sections).filter_by(skill).first()

    stmt = (
      update(ModelMetadata)
      .where(ModelMetadata.section_id == section.id)
      .values(**updated_data)
      .returning(ModelMetadata)
    )

    res = self.db.execute(stmt)
    self.db.commit()

    return res
    