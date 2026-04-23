# Sử dụng bản Spark 3.5.1 từ Bitnami (nhẹ và đã cấu hình sẵn Java 17)
FROM apache/spark:4.1.1-python3

# Chuyển sang quyền root để cài đặt thư viện
USER root

WORKDIR /app

# 1. Cài đặt các thư viện hệ thống cần thiết cho PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 2. Cài đặt thư viện Python
COPY requirements.txt .
COPY ./jdbc-driver ./jdbc-driver
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy mã nguồn
COPY . .

# 4. Phân quyền (Apache Spark image dùng user 185)
RUN chown -R 185:185 /app
USER 185

CMD ["python3", "spark.py"]