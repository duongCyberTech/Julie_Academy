# ==========================================
# Stage 1: Builder (Môi trường build)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli
# Cài đặt toàn bộ thư viện (bao gồm cả dev)
COPY package*.json ./
RUN npm ci

# Copy toàn bộ code vào và generate Prisma Client
COPY . .
RUN npx prisma generate

# Build ứng dụng NestJS
RUN npm run build

# KHÔNG dùng npm prune ở đây nữa!

# ==========================================
# Stage 2: Production (Môi trường chạy thực tế)
# ==========================================
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Chỉ copy file quản lý thư viện
COPY package*.json ./

# Cài đặt CHỈ thư viện production (giúp image nhẹ và sạch)
RUN npm ci --only=production

# --- ĐÂY LÀ CHÌA KHÓA CỦA PRISMA ---
# Copy Prisma Client đã được generate từ Stage 1 sang Stage 2
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Copy thư mục dist đã build xong
COPY --from=builder /usr/src/app/dist ./dist

# Copy schema để có thể chạy migrate nếu cần trên server
COPY --from=builder /usr/src/app/prisma ./prisma

# Đổi quyền sang user 'node'
USER node

EXPOSE 4000

CMD ["node", "dist/main.js"]