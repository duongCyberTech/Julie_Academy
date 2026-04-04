import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import rabbitmqConfig from 'src/config/rabbitmq.config';

@Module({
  imports: [
    ConfigModule.forFeature(rabbitmqConfig),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
