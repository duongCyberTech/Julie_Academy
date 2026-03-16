import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';
require('dotenv').config()

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Loại bỏ các field không được định nghĩa trong DTO
      forbidNonWhitelisted: false, // Quăng lỗi nếu có field lạ
      transform: true,       // ✅ BẮT BUỘC ĐỂ ÉP KIỂU DỮ LIỆU
    }));

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
    
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(process.env.PORT);
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}
bootstrap();
