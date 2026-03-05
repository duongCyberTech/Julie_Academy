import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
<<<<<<< HEAD:tutor-service/src/main.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các field không được định nghĩa trong DTO
    forbidNonWhitelisted: false, // Quăng lỗi nếu có field lạ
    transform: true,       // ✅ BẮT BUỘC ĐỂ ÉP KIỂU DỮ LIỆU
    transformOptions: {
      enableImplicitConversion: true, // (Tùy chọn) Tự động ép kiểu theo type khai báo
    },
  }));
=======
import { NestExpressApplication } from '@nestjs/platform-express'; // Mới thêm
import { join } from 'path'; // Mới thêm
require('dotenv').config();

async function bootstrap() {
  // Thêm <NestExpressApplication> để báo cho TS biết đây là ứng dụng Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CẤU HÌNH PHỤC VỤ FILE TĨNH 
  // process.cwd() lấy thư mục gốc dự án (nơi có file package.json)
  // join(...) nối vào thư mục 'uploads'
  // prefix: '/uploads/' nghĩa là đường dẫn sẽ có dạng http://domain/uploads/ten-file.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4:backend/src/main.ts

  const config = new DocumentBuilder()
    .setTitle('Julie Academy API')
    .setDescription('The Julie Academy API description')
    .setVersion('1.0')
    .addTag('Julie Academy')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors();
<<<<<<< HEAD:tutor-service/src/main.ts
  
  app.useWebSocketAdapter(new IoAdapter(app));
=======
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4:backend/src/main.ts
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
