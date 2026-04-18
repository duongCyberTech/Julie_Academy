# app/repositories/training_data_repository.py
from sqlalchemy.orm import Session, aliased, contains_eager
from sqlalchemy import select, func, and_
import pandas as pd
from app.models.training_data import TrainingData
from app.models.sections import Sections

BATCH_SIZE = 1000
USER_SIZE = 100
class TrainingDataRepository:

  def create(self, db: Session, data: dict):
    obj = TrainingData(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
  
  def get_batch(self, db: Session, session_id: str, size: int = BATCH_SIZE):
    return db.query(TrainingData).filter_by(session_id=session_id).limit(size).all()

  def get_many_batches(self, db: Session, nb_of_users: int = 10, size: int = 5) -> pd.DataFrame:
    # 1. Subquery đánh số thứ tự cho TrainingData theo từng Section
    subq = (
      select(
        TrainingData,
        func.row_number().over(
          partition_by=TrainingData.section_id,
          order_by=TrainingData.order_id.desc()
        ).label("rn")
      )
    ).subquery()

    post_alias = aliased(TrainingData, subq)

    # 2. Truy vấn lấy N Sections, mỗi Section kèm M TrainingData mới nhất
    stmt = (
      select(Sections)
      .join(subq, Sections.id == subq.c.section_id)
      .where(subq.c.rn <= size)
      .options(contains_eager(Sections.posts.of_type(post_alias)))
      .order_by(Sections.id)
      .limit(nb_of_users)
    )

    results = db.execute(stmt).scalars().unique().all()

    # 3. Phẳng hóa dữ liệu (Flattening) để đưa vào DataFrame
    rows = []
    for sec in results:
      for p in sec.posts:
        rows.append({
          "section_id": sec.id,
          "user_id": sec.user_id,
          "skill": sec.skill,
          "grade": sec.grade,
          "subject": sec.subject,
          "training_id": p.id,
          "problem_id": p.problem_id,
          "level": p.level.value if p.level else None,
          "order_id": p.order_id,
          "correct": p.correct
        })

    return pd.DataFrame(rows)
