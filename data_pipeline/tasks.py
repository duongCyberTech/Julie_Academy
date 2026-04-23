from celery import Celery
from celery.schedules import crontab
import subprocess

# Khởi tạo Celery app, kết nối tới Redis (lát nữa sẽ dựng bằng Docker)
app = Celery('julie_etl', broker='redis://redis_broker:6378/0')

# Cấu hình Múi giờ (Rất quan trọng cho Cronjob)
app.conf.broker_connection_retry_on_startup = True
app.conf.timezone = 'Asia/Ho_Chi_Minh'

# Thiết lập Lịch chạy (Cron Job)
app.conf.beat_schedule = {
    'run-spark-pipeline-daily': {
        'task': 'tasks.trigger_spark',
        # Cấu hình chạy vào 02:00 sáng mỗi ngày. 
        # (Bạn có thể đổi thành crontab(minute='*') để test chạy mỗi phút)
        'schedule': crontab(minute=0, hour=2), 
    },
}

@app.task(bind=True, max_retries=3)
def trigger_spark(self):
    print("🚀 Đang khởi động đường ống Spark ETL...")
    
    # Dùng subprocess để gọi file spark.py giống như bạn gõ lệnh trên terminal
    result = subprocess.run(
        ["python3", "spark.py"], 
        capture_output=True, 
        text=True
    )
    
    # Kiểm tra kết quả
    if result.returncode == 0:
        print("✅ Pipeline chạy thành công!")
        return "Success"
    else:
        print(f"❌ Lỗi Pipeline:\n{result.stderr}")
        # Tự động thử lại (retry) nếu fail, tối đa 3 lần, cách nhau 60s
        raise self.retry(countdown=60)