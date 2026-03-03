import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3Service } from 'src/resource/aws/aws-s3.service';
import { CloudinaryService } from 'src/resource/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDTO } from 'src/notifications/dto/notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from './bull-queue.service';
import { AnalysisService } from 'src/analysis/analysis.service';
import { ExamType } from '@prisma/client';

@Injectable()
export class BackgroundService {
  constructor(
    private cloudinary: CloudinaryService,
    private s3: S3Service,
    private notify: NotificationsService,
    private prisma: PrismaService,
    private jobQueue: QueueService,
    private analysisService: AnalysisService
  ){}

  @OnEvent('cloudinary.delete')
  async handleDeleteCloudinaryMedias(deletedMedias: string[]) {
    const extractPublicId = (url: string): string => {
      const regex = /\/v\d+\/([^\.]+)/;
      const match = url.match(regex);
      
      return match ? match[1] : null;
    };

    const publicIds = deletedMedias.map(item => extractPublicId(item))

    await this.cloudinary.deleteFiles(publicIds)
  }

  @OnEvent('s3.delete')
  async handleDeleteS3Files(deleteFiles: string[]) {
    const extractS3Key = (url: string): string => {
      const parts = url.split('.amazonaws.com/');
      if (parts.length > 1) {
        return parts[1];
      }
      return null;
    };

    const s3Keys = deleteFiles.map(item => extractS3Key(item))

    await this.s3.deleteFiles(s3Keys)
  }

  @OnEvent('notify.new')
  async handleSendNotification(payload: {uid: string, notiData: CreateNotificationDTO, email?: string}) {
    await this.notify.createNotification(payload.uid, payload.notiData)
  }

  @OnEvent('thread.new')
  async handleSendNotificationToClass(notiData: CreateNotificationDTO) {
    const restriction = await this.prisma.thread.findUnique({
      where: {thread_id: notiData.link_primary_id},
      select: {
        open_list: true,
        is_restricted: true,
        sender: {select: {uid: true}}
      }
    })

    const rawJsonData = restriction.open_list
    
    let validUids: string[] = [];

    if (Array.isArray(rawJsonData)) {
      validUids = rawJsonData as string[];
    } else if (typeof rawJsonData === 'string') {
      try {
        const parsed = JSON.parse(rawJsonData);
        validUids = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        validUids = [];
      }
    }

    const senders = await this.prisma.student.findMany({
      where: {
        learning: {some: {class: {class_id: notiData.link_wrapper_id}}},
        user: {thread: {some: {uid: {not: restriction.sender.uid}}}}, 
        ...(restriction.is_restricted ? {uid: {in: validUids}} : {}) 
      },
      select: {uid: true}
    })

    senders.forEach(async(sender) => {
      await this.notify.createNotification(sender.uid, notiData)
    })
  }

  @OnEvent('thread.comment.new')
  async handleSendToFollower(notiData: CreateNotificationDTO) {
    const senders = await this.prisma.follow.findMany({
      where: {thread_id: notiData.link_primary_id},
      select: {uid: true}
    })

    senders.forEach(async(sender) => {
      await this.notify.createNotification(sender.uid, notiData)
    })
  }

  @OnEvent('exam.new')
  async handleSetupDeadlineNotify(newSession: any){
    console.log("[LOG DELAYED JOB]")
    try {
      const TIME_NOTIFY_BEFORE_TEST = 60 * 60 * 1000;
      const currentTime = new Date().getTime()
      const delayTime = newSession.startAt.getTime() - currentTime - TIME_NOTIFY_BEFORE_TEST
      const payload = {
        exam_id: newSession.exam_id,
        session_id: newSession.session_id,
        action: "notify_test_starting",
        message: "Sắp bắt đầu làm bài!"
      }
      const jobId = await this.jobQueue.setupNotifyDeadline(payload, delayTime)
      if (jobId){
        console.log(`[${jobId}]`)
        await this.prisma.exam_session.update({
          where: {exam_id_session_id: {exam_id: newSession.exam_id, session_id: newSession.session_id}},
          data: {
            job_id: jobId.toString()
          }
        })   

        console.log(`[JOB SUBMITTED]`)
      } else {
        console.log(`[JOB NOT SUBMITTED]`)
      }    
    } catch (error) {
      console.log(error.message)
    }
  }

  @OnEvent('exam_taken.submit')
  async handleExamSubmission(payload: {
    uid: string,
    sum_exam: number,
    total_questions: number,
    total_correct_questions: number,
    final_score: number,
    exam_type: ExamType
  }) {
    try {
      await this.analysisService.createOrUpdateAnalytics(payload.uid, {
        sum_exam: payload.sum_exam,
        ...(payload.exam_type === ExamType.practice ? {max_score_practice: payload.final_score} : {}),
        streak: 1,
        last_exam_taken_date: new Date()
      })
    } catch (error) {
      return
    }
  }
}