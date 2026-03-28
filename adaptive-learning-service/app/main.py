from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="ML Service")

app.include_router(api_router, prefix="/api")