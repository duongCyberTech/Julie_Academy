from celery import Celery
from celery.schedules import crontab
from app.core.database import SessionLocal
from app.services.monitor_service import MonitorService
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.RABBITMQ_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.timezone = 'Asia/Ho_Chi_Minh'

celery_app.conf.beat_schedule = {
    'run-preprocessing-every-night': {
        'task': 'app.worker.model_monitor.run_daily_preprocessing',
        'schedule': crontab(hour=0, minute=0),
    },
}

@celery_app.task
def run_daily_preprocessing():
    print("Starting scheduled preprocessing...")
    
    with SessionLocal() as db:
        service = MonitorService(db=db)
        service.run_test()
        
    print("Scheduled preprocessing complete!")
    return "Success"