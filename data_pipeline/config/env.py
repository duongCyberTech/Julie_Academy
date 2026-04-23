from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
  SRC_URL: str
  TARGET_URL: str
  DB_USER: str
  DB_PASS: str
  DB_PORT: int
  DB_DRIVER: str

  class Config:
    env_file = ".env"

# Get the path to the directory where this file lives
# Then go up one level to 'app' and into 'core'
BASE_DIR = Path(__file__).resolve().parent.parent
JDBC_JAR_PATH = BASE_DIR / "jdbc-driver" / "postgresql-42.7.10.jar"

settings = Settings()