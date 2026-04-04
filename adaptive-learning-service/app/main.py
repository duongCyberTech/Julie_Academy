from fastapi import FastAPI
from app.api.router import api_router

from contextlib import asynccontextmanager

from app.core.rabbitmq import rabbitmq

@asynccontextmanager
async def lifespan(app: FastAPI):
  # startup
  await rabbitmq.connect()

  yield

  # shutdown
  await rabbitmq.close()

app = FastAPI(title="ML Service", lifespan=lifespan)
app.include_router(api_router, prefix="/api")