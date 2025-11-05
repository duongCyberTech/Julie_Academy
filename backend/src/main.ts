import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
