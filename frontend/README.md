# Julie Academy Frontend

## Công nghệ sử dụng

- React 19
- Vite
- Material UI (MUI)
- Framer Motion
- React Router DOM
- React Helmet Async

## Hướng dẫn cài đặt và chạy dự án

### 1. Cài đặt các package cần thiết

```powershell
cd frontend
npm install react-router-dom framer-motion @mui/material @mui/icons-material react-helmet-async @emotion/react @emotion/styled --legacy-peer-deps
```

### 2. Chạy dự án

```powershell
npm run dev
```

### 3. Build production

```powershell
npm run build
```

### 4. Các lệnh khác

- Kiểm tra lint: `npm run lint`
- Format code: `npm run format` (nếu có cấu hình Prettier)

## Lưu ý

- Nếu dùng React 19, một số package có thể chưa hỗ trợ hoàn toàn. Nếu gặp lỗi, kiểm tra lại phiên bản hoặc dùng thêm `--legacy-peer-deps` khi cài đặt.
- Đảm bảo đã cài Node.js >= 18.

## Kiến trúc thư mục

- `src/components`: Các component dùng lại (Card, Header, Footer,...)
- `src/pages`: Các trang chính (HomePage,...)
- `src/routes`: Định tuyến
- `src/context`: ThemeProvider, context
- `src/assets`: Hình ảnh, icon

## Tác giả

- Julie Academy Team
