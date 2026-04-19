# app/repositories/training_data_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import select
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
        Sections.id.label("section_id"),
        Sections.level,          # Now pulling from Sections
        Sections.skill,
        Sections.grade,
        Sections.subject,
        TrainingData.id.label("training_id"),
        TrainingData.user_id,    # Now pulling from TrainingData
        TrainingData.problem_id,
        TrainingData.order_id,
        TrainingData.correct
      )
      .join(Sections, TrainingData.section_id == Sections.id)
      .limit(BATCH_SIZE) 
    )

    # 2. Fetch data mapped to column names
    results = self.db.execute(stmt).mappings().all()

    # 3. Convert to DataFrame
    df = pd.DataFrame(results)
    
    # 4. Handle the LevelStatus Enum correctly
    if not df.empty and 'level' in df.columns:
        # Extracts the string value (e.g., "easy") from the Enum object
        df['level'] = df['level'].apply(lambda x: x.value if hasattr(x, 'value') else x)

    return df
