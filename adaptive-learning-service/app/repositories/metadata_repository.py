from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from app.models.model_metadata import ModelMetadata
from app.models.sections import Sections
import pandas as pd

class MetadataRepository:
  def __init__(self, db: Session):
    self.db = db

  def create(self):
    pass

  def get_many(self):
    stmt = (
      select(
        Sections.skill,
        ModelMetadata.p_init,
        ModelMetadata.p_transit,
        ModelMetadata.p_slip,
        ModelMetadata.p_guess
      )
      .join(Sections, ModelMetadata.section_id == Sections.skill)
    )

    results = self.db.execute(stmt).mappings().all()
    df = pd.DataFrame(results)

    return df

  def get_by_section(self, section_id: str):
    pass

  def get_by_id(self, id: str):
    pass

  def update_full_params(self, skill, p_init, p_transit, p_guess, p_slip):
    """
    Sử dụng PostgreSQL UPSERT (ON CONFLICT DO UPDATE)
    """
    # 1. Tạo câu lệnh Insert cơ bản
    stmt = insert(ModelMetadata).values(
      section_id=skill, # Giả định section_id là khóa chính hoặc có UNIQUE constraint
      p_init=p_init,
      p_transit=p_transit,
      p_guess=p_guess,
      p_slip=p_slip
    )

    # 2. Thêm logic xử lý xung đột (Upsert)
    # Giả sử 'section_id' là cột có ràng buộc UNIQUE hoặc Primary Key
    upsert_stmt = stmt.on_conflict_do_update(
      index_elements=['section_id'], # Cột dùng để xác định trùng lặp
      set_={
        'p_init': p_init,
        'p_transit': p_transit,
        'p_guess': p_guess,
        'p_slip': p_slip
      }
    )

    # 3. Thực thi
    try:
      self.db.execute(upsert_stmt)
      self.db.commit()
    except Exception as e:
      self.db.rollback()
      print(f"Error upserting BKT params for {skill}: {e}")
    