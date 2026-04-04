# Julie_Academy
# Cách chạy adaptive learning
1. Khởi tạo RabbitMQ
```
cd mqtt
docker compose up
```

2. Chạy tutor-service
3. Chạy worker bên FastAPI
```
cd adaptive-learning-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m app.worker.consumer
```