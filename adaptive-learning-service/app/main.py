from fastapi import FastAPI
from app.api.router import api_router
import asyncio
from contextlib import asynccontextmanager
from app.worker.consumer import start_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
  try:
    # START THE WORKER IN A SEPARATE THREAD
    worker_task = asyncio.create_task(asyncio.to_thread(start_worker))
    print("Worker started in background thread")
  except Exception as e:
    print("Error starting worker:", e)

  yield

  # Note: gracefully shutting down a threaded pika connection 
  # is a bit trickier, but cancelling the task is a start.
  worker_task.cancel()

app = FastAPI(title="ML Service", lifespan=lifespan)
app.include_router(api_router, prefix="/api")