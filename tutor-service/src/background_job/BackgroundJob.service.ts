import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3Service } from 'src/resource/aws/aws-s3.service';
import { CloudinaryService } from 'src/resource/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDTO } from 'src/notifications/dto/notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BackgroundService {
  constructor(
    private cloudinary: CloudinaryService,
    private s3: S3Service,
    private notify: NotificationsService,
    private prisma: PrismaService
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
        is_restricted: true
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
}