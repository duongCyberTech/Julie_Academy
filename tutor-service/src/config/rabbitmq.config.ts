import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Xác định môi trường
const env = process.env.NODE_ENV || 'development';

// 2. Chỉ định chính xác đường dẫn file env
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  queue: process.env.RABBITMQ_QUEUE,
}));
