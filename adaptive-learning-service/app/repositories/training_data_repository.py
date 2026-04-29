# app/repositories/training_data_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, select, func, text
import pandas as pd
from app.models.training_data import TrainingData
from app.models.sections import Sections

BATCH_SIZE = 1000
USER_SIZE = 100
class TrainingDataRepository:
  def __init__(self, db: Session):
    self.db = db

  def create(self, data: dict):
    obj = TrainingData(**data)
    self.db.add(obj)
    self.db.commit()
    self.db.refresh(obj)
    return obj
  
  def get_batch(self, session_id: str, size: int = BATCH_SIZE):
    return self.db.query(TrainingData).filter_by(session_id=session_id).limit(size).all()

  def get_many_batches(self) -> pd.DataFrame:
  # 1. Map exactly to your provided schema
    stmt = (
      select(
        Sections.skill,
        Sections.user_id,    # Now pulling from TrainingData
        TrainingData.problem_id,
        TrainingData.order_id,
        TrainingData.correct
      )
      .join(
        Sections, 
        and_(
          TrainingData.section_id == Sections.skill,
          TrainingData.user_id == Sections.user_id
        )
      )
      .where(TrainingData.order_id >= func.now() - text("INTERVAL '24 hours'"))
    )

    # 2. Fetch data mapped to column names
    results = self.db.execute(stmt).mappings().all()

    # 3. Convert to DataFrame
    df = pd.DataFrame(results)

    return df
