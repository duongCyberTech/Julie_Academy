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

# Các lệnh tương tác với container tutor-service
1. Rebuild and run
```{r}
docker compose up tutor-service --build
```

2. Nest console
```{r}
docker compose exec tutor-service npm run start -- --watch --entryFile repl
```

3. Migration
```{r}
docker compose exec tutor-service npx prisma migrate dev
docker compose exec tutor-service npx prisma generate
```