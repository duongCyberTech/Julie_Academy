from time import time
import traceback

import pika
import json
from app.core.config import settings
from app.services.instant_computing_service import InstantComputingService

instant_computing_service = InstantComputingService()

def callback(ch, method, properties, body):
  data = json.loads(body)

  result = instant_computing_service.compute_instant_knowledge(data, {}).to_dict()

  if properties.reply_to:
    response = {
      "type": "BKT_RESULT",
      "payload": {
        "result": result["p_l"]
      }
    }

    ch.basic_publish(
      exchange='',
      routing_key=properties.reply_to,
      properties=pika.BasicProperties(
        correlation_id=properties.correlation_id
      ),
      body=json.dumps(response)
    )

  ch.basic_ack(delivery_tag=method.delivery_tag)


def start_worker():
  while True:
    try:
      print("Đang cố gắng kết nối tới RabbitMQ...")
      credentials = pika.PlainCredentials(settings.RMQ_USER, settings.RMQ_PASS)
      params = pika.ConnectionParameters(
        host=settings.RMQ_HOST,
        port=int(settings.RMQ_PORT), # Đảm bảo port là số nguyên
        virtual_host=settings.RMQ_VHOST,
        credentials=credentials
      )

      connection = pika.BlockingConnection(params)
      channel = connection.channel()

      # Lệnh này sẽ thực sự tạo ra queue nếu nó chưa tồn tại
      channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

      channel.basic_qos(prefetch_count=1)
      channel.basic_consume(
        queue=settings.RABBITMQ_QUEUE,
        on_message_callback=callback
      )
      print("Worker đã kết nối tới RabbitMQ và đang chờ tin nhắn...")
      channel.start_consuming()

    except pika.exceptions.AMQPConnectionError:
      print("RabbitMQ chưa khởi động xong. Sẽ thử lại sau 5 giây...")
      time.sleep(5)
    except Exception as e:
      print("WORKER BỊ LỖI NGHIÊM TRỌNG:")
      traceback.print_exc()
      time.sleep(5)

if __name__ == "__main__":
  start_worker()