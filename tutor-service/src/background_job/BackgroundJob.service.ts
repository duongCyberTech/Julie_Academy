import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3Service } from 'src/resource/aws/aws-s3.service';
import { CloudinaryService } from 'src/resource/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDTO } from 'src/notifications/dto/notification.dto';

@Injectable()
export class BackgroundService {
  constructor(
    private cloudinary: CloudinaryService,
    private s3: S3Service,
    private notify: NotificationsService
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
    console.log("notificaton to: ", payload.email)
    await this.notify.createNotification(payload.uid, payload.notiData)
  }
}