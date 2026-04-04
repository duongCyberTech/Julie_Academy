import pika
import json
from app.core.config import settings
from app.services.instant_computing_service import InstantComputingService

instant_computing_service = InstantComputingService()

def callback(ch, method, properties, body):
  data = json.loads(body)

  print("Received:", data)

  result = instant_computing_service.compute_instant_knowledge(data, {}).to_dict()

  print("Processed:", result)

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
  credentials = pika.PlainCredentials(settings.RMQ_USER, settings.RMQ_PASS)

  params = pika.ConnectionParameters(
    host=settings.RMQ_HOST,
    port=settings.RMQ_PORT,
    virtual_host=settings.RMQ_VHOST,
    credentials=credentials
  )

  connection = pika.BlockingConnection(params)
  channel = connection.channel()

  channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

  channel.basic_qos(prefetch_count=1)

  channel.basic_consume(
    queue=settings.RABBITMQ_QUEUE,
    on_message_callback=callback
  )

  print("Waiting for messages...")
  channel.start_consuming()

if __name__ == "__main__":
  start_worker()