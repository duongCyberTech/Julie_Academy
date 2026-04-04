import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { uuidv7 as uuid } from 'uuidv7';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: amqp.Channel;
  private replyQueue: string;
  constructor(private configService: ConfigService) {}

  private pending = new Map<string, (data: any) => void>();

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url');
    const conn = await amqp.connect(url);

    this.channel = await conn.createChannel();

    // 👇 tạo queue tạm để nhận response
    const q = await this.channel.assertQueue('', { exclusive: true });
    this.replyQueue = q.queue;

    // 👇 lắng nghe response
    this.channel.consume(
      this.replyQueue,
      (msg) => {
        if (!msg) return;

        const correlationId = msg.properties.correlationId;
        const data = JSON.parse(msg.content.toString());
        console.log("Received response:", data);

        if (this.pending.has(correlationId)) {
          this.pending.get(correlationId)(data.payload.result);
          this.pending.delete(correlationId);
        }

        this.channel.ack(msg);
      },
      { noAck: false }
    );
  }

  async sendAndWait(data: any): Promise<any> {
    const correlationId = uuid();
    const queue: string = this.configService.get<string>('rabbitmq.queue') ?? "";
    console.log("Sending message to queue:", queue, "with correlationId:", correlationId);
    console.log("Message content:", data);

    return new Promise((resolve) => {
      this.pending.set(correlationId, resolve);

      this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(data)),
        {
          correlationId,
          replyTo: this.replyQueue,
          persistent: true,
        }
      );
    });
  }
}