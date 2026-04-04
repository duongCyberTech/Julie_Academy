import aio_pika
from app.core.config import settings

class RabbitMQ:
  def __init__(self):
    self.connection = None
    self.channel = None

  async def connect(self):
    self.connection = await aio_pika.connect_robust(
      settings.RABBITMQ_URL
    )
    self.channel = await self.connection.channel()
    print("✅ RabbitMQ connected")

  async def close(self):
    if self.connection:
      await self.connection.close()
      print("❌ RabbitMQ closed")


rabbitmq = RabbitMQ()