from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  DATABASE_URL: str
  DATABASE_ASYNC_URL: str
  JWT_SECRET: str
  JWT_ALGO: str
  RABBITMQ_URL: str
  RABBITMQ_QUEUE: str
  RMQ_USER: str
  RMQ_PASS: str
  RMQ_HOST: str
  RMQ_PORT: int
  RMQ_VHOST: str
  REDIS_URL: str

  class Config:
    env_file = ".env"

settings = Settings()