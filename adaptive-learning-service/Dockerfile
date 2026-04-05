# Bước 1: Sử dụng Python image chính thức (bản slim để nhẹ hơn)
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /code

# Thiết lập biến môi trường để Python không tạo file .pyc và log được in trực tiếp
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Cài đặt các phụ kiện hệ thống nếu cần (ví dụ: gcc cho một số thư viện python)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy file requirements trước để tận dụng Docker cache
COPY ./requirements.txt /code/requirements.txt

# Cài đặt các thư viện
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ code vào thư mục làm việc
COPY ./app /code/app

# Mở cổng 8000 (cổng mặc định thường dùng cho FastAPI)
EXPOSE 8000

# Lệnh chạy ứng dụng sử dụng Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]