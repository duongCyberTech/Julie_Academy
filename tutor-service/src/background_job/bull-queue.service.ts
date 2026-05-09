import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ExamTakenTimeoutPayload } from './dto/payload.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('system-tasks-queue') private bgQueue: Queue
  ) {}

  async getJobMetrics(): Promise<{ waiting: number; active: number; completed: number; failed: number; delayed: number }> {
    try {
      const waitingCount = await this.bgQueue.getWaitingCount();
      const activeCount = await this.bgQueue.getActiveCount();
      const completedCount = await this.bgQueue.getCompletedCount();
      const failedCount = await this.bgQueue.getFailedCount();
      const delayedCount = await this.bgQueue.getDelayedCount();

      return {
        waiting: waitingCount,
        active: activeCount,
        completed: completedCount,
        failed: failedCount,
        delayed: delayedCount
      };
    } catch (error) {
      this.logger.error('Lỗi khi lấy metrics của Background Job', (error as Error).stack);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      }
    }
  }

  async setupExamTakenTimeout(payload: ExamTakenTimeoutPayload, delayInMs: number) {
    try {
      console.log("[EXAM SESSION TIMEOUT QUEUING]")
      const job = await this.bgQueue.add(
        'exam-taken-timeout',
        payload,
        {
          delay: delayInMs,
          removeOnComplete: { count: 10 },
          removeOnFail: { count: 10 },
          attempts: 3,
          backoff: 5000
        }
      );
      this.logger.log(`[EXAM SESSION TIMEOUT] Đã đưa vào hàng đợi, sẽ chạy sau ${delayInMs}ms`);
      console.log("[EXAM SESSION TIMEOUT QUEUING SUCCESSFULLY]")
      return job.id
    } catch (error) {
      console.log("[EXAM SESSION TIMEOUT QUEUING WITH ERROR]")
      this.logger.error('Lỗi khi lên lịch Background Job', (error as Error).stack);
    }
  }

  async setupNotifyDeadline(payload: any, delayInMs: number) {
    try {
      console.log("[NOTIFICATION QUEUING]")
      const job = await this.bgQueue.add(
        'setup-deadline',
        payload,
        {
          delay: delayInMs,
          removeOnComplete: { count: 10 },
          removeOnFail: { count: 10 },
          attempts: 3,
          backoff: 5000
        }
      );
      this.logger.log(`[EXAM SESSION DEADLINE] Đã đưa vào hàng đợi, sẽ chạy sau ${delayInMs}ms`);
      console.log("[NOTIFICATION QUEUING SUCCESSFULLY]")
      return job.id
    } catch (error) {
      console.log("[NOTIFICATION QUEUING WITH ERROR]")
      this.logger.error('Lỗi khi lên lịch Background Job', (error as Error).stack);
    }
  }
}