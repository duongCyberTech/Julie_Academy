import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
