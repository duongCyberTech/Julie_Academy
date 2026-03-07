import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDTO } from 'src/notifications/dto/notification.dto';
import { NotificationType } from '@prisma/client';

@Processor('system-tasks-queue')
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notify: NotificationsService
  ) {}

  @Process('exam-taken-timeout')
  async handleExamTakenTimeout(job: Job) {
    this.logger.log(`Queue Job ID: ${job.id}`);
    const {
      et_id,
      timeoutAt
    } = job.data;

    try {
      await this.prisma.exam_taken.update({
        where: {et_id},
        data: {
          isDone: true,
          doneAt: new Date()
        }
      })
      this.logger.log(`[EXAM SESSION TIMEOUT] - ${timeoutAt} [LOG] Phiên thi đã được đánh dấu là timeout!`);
    } catch (error) {
      this.logger.error(`[EXAM SESSION TIMEOUT] thất bại: ${error.message}`, error.stack);
    }
  }

  @Process('setup-deadline')
  async handleSetupDeadline(job: Job) {
    this.logger.log(`Queue Job ID: ${job.id}`);
    
    const {
      exam_id,
      session_id,
      action,
      message
    } = job.data;

    try {
      const receivers = await this.prisma.class.findMany({
        where: {exam_open_in: {some: {exam_session: {exam_id, session_id}}}},
        select: {
          learning: {select: {student_uid: true}}
        }
      }).then(receivers => {
        const idList: string[] = []
        receivers.forEach((r) => {
          idList.push(...r.learning.map(i => i.student_uid))
        })
        return idList
      })

      const notiData: CreateNotificationDTO = {
        message,
        type: NotificationType.exam,
        link_primary_id: exam_id,
        link_partial_id: `${session_id}`
      }

      this.logger.log(`[THÔNG BÁO] Đang thiết lập thông báo với dữ liệu: ${JSON.stringify(notiData)} cho người nhận: ${receivers.join(", ")}`);
      receivers.forEach(async(r) => {
       await this.notify.createNotification(r, notiData)
      })

      this.logger.log(`[THÔNG BÁO] Thông báo đã được thiết lập thành công!`);
    } catch (error) {
      this.logger.error(`[THÔNG BÁO] thất bại: ${error.message}`, error.stack);
    }
  }
}