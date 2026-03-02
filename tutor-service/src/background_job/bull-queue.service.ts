import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('system-tasks-queue') private bgQueue: Queue
  ) {}

  async setupNotifyDeadline(payload: any, delayInMs: number) {
    try {
      console.log("[NOTIFICATION QUEUING]")
      const job = await this.bgQueue.add(
        'setup-deadline',
        payload,
        {
          delay: delayInMs,
          removeOnComplete: true,
          attempts: 3,
          backoff: 5000
        }
      );
      this.logger.log(`[EXAM SESSION DEADLINE] Đã đưa vào hàng đợi, sẽ chạy sau ${delayInMs}ms`);
      console.log("[NOTIFICATION QUEUING SUCCESSFULLY]")
      return job.id
    } catch (error) {
      console.log("[NOTIFICATION QUEUING WITH ERROR]")
      this.logger.error('Lỗi khi lên lịch Background Job', error.stack);
    }
  }
}