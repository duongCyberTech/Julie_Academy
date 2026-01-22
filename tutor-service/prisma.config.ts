import { defineConfig } from '@prisma/config';
require('dotenv').config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Đây là nơi bạn đặt URL kết nối cho các lệnh CLI (migrate, generate)
    url: process.env.DATABASE_URL,
  },
});