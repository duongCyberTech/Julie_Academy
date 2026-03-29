from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(
  settings.DATABASE_URL,
  pool_pre_ping=True,
  echo=True
)

SessionLocal = sessionmaker(
  bind=engine,
  autocommit=False,
  autoflush=False
)

class Base(DeclarativeBase):
  pass

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()