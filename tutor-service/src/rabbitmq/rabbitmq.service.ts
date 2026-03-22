import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService
  implements OnModuleInit, OnModuleDestroy {

  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url');
    const queue = this.configService.get<string>('rabbitmq.queue');

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(queue, { durable: true });

    console.log('RabbitMQ connected');
  }

  async publish(data: any) {
    const queue = this.configService.get<string>('rabbitmq.queue');

    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
