from sqlalchemy.orm import Session
from app.models.model_metadata import ModelMetadata

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

  def update(self):
    pass