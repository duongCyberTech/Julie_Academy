import aio_pika
import json
from app.core.rabbitmq import rabbitmq

async def send_message(queue_name: str, data: dict):
  message = aio_pika.Message(
    body=json.dumps(data).encode(),
    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
  )

  await rabbitmq.channel.default_exchange.publish(
    message,
    routing_key=queue_name
  )