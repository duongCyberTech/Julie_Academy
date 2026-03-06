import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Xác định môi trường, mặc định là development
const env = process.env.NODE_ENV || 'development';

// Load file .env tương ứng (ví dụ: .env.staging)
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma sẽ lấy DATABASE_URL từ file .env.{env} đã load ở trên
    url: process.env.DATABASE_URL,
  },
});