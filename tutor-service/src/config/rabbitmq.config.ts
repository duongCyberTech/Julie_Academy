import { registerAs } from '@nestjs/config';
require("dotenv").config()

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  queue: process.env.RABBITMQ_QUEUE || 'ai_tasks',
}));
