import json
from pathlib import Path

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, select, func, text
from sqlalchemy.dialects.postgresql import insert
from app.models.model_metadata import ModelMetadata
from app.models.sections import Sections
import pandas as pd

class MetadataRepository:
  def __init__(self, db: Session):
    self.db = db
    BASE_DIR = Path(__file__).resolve().parent.parent
    JSON_PATH = BASE_DIR / "core" / "default_index.json"

    with open(JSON_PATH, "r", encoding="utf-8") as f:
      self.default_index = json.load(f)
    print("Loaded default index:", self.default_index)

  def create(self):
    pass

  def get_many(self):
    stmt = (
      select(
        Sections.skill,
        Sections.user_id,
        func.coalesce(ModelMetadata.p_init, self.default_index["prior"]).label("p_init"),
        func.coalesce(ModelMetadata.p_transit, self.default_index["learns"]).label("p_transit"),
        func.coalesce(ModelMetadata.p_slip, self.default_index["slips"]).label("p_slip"),
        func.coalesce(ModelMetadata.p_guess, self.default_index["guesses"]).label("p_guess")
      )
      .select_from(Sections)
      .outerjoin(
        ModelMetadata,
        and_(
          Sections.skill == ModelMetadata.section_id,
          Sections.user_id == ModelMetadata.user_id
        )
      )
      .where(
        or_(
          ModelMetadata.section_id == None, # Metadata chưa tồn tại
          ModelMetadata.last_updated_at < (func.now() - text("INTERVAL '24 hours'")) # Hoặc đã quá 24h
        )
      )
    )

    results = self.db.execute(stmt).mappings().all()
    df = pd.DataFrame(results)

    return df

  def get_by_user_and_skill(self, skill: str, user_id: str):
    params = self.db.query(ModelMetadata).filter_by(user_id=user_id, section_id=skill).first()
    if params == None: return {}

    return {
      "prior": params.p_init,
      "learns": params.p_transit,
      "guesses": params.p_guess,
      "slips": params.p_slip
    }

  def update_full_params(self, skill, user_id, p_init, p_transit, p_guess, p_slip):
    """
    Sử dụng PostgreSQL UPSERT (ON CONFLICT DO UPDATE)
    """
    # 1. Tạo câu lệnh Insert cơ bản
    stmt = insert(ModelMetadata).values(
      section_id=skill,
      user_id=user_id,
      p_init=p_init,
      p_transit=p_transit,
      p_guess=p_guess,
      p_slip=p_slip, 
      last_updated_at=func.now()
    )

    # 2. Thêm logic xử lý xung đột (Upsert)
    # Giả sử 'section_id' là cột có ràng buộc UNIQUE hoặc Primary Key
    upsert_stmt = stmt.on_conflict_do_update(
      index_elements=['section_id', 'user_id'], # Cột dùng để xác định trùng lặp
      set_={
        'p_init': p_init,
        'p_transit': p_transit,
        'p_guess': p_guess,
        'p_slip': p_slip,
        'last_updated_at': func.now()
      }
    )

    # 3. Thực thi
    try:
      self.db.execute(upsert_stmt)
      self.db.commit()
    except Exception as e:
      self.db.rollback()
      print(f"Error upserting BKT params for {skill}: {e}")
    