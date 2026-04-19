# console.py
from app.core.database import get_db, SessionLocal
from app import models
from app.repositories.section_repository import SectionRepository
from app.services.preprocessing_service import Preprocessing

# Optional: Ensure tables are created (useful for local dev)
# models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("🚀 FastAPI Console Loaded!")
print("Available objects: db, models")
print("Example query: db.query(models.User).all()")