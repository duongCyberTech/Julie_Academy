from sqlalchemy.orm import Session
from app.models.sections import Sections
from app.schemas.section import CreateSectionDto
from app.core.database import get_db

class SectionRepository:
  def __init__(self, db: Session):
    self.db = db

  def create(self, data: CreateSectionDto):
    obj = Sections(**data)
    self.db.add(obj)
    self.db.commit()
    self.db.refresh(obj)
    return obj

  def get_many(self, limit: int = 10, page: int = 1):
    return self.db.query(Sections).limit(limit).offset((page - 1) * limit).all()

  def get_by_id(self, id: str):
    return self.db.query(Sections).filter_by(id=id).first()

  def update(self):
    pass