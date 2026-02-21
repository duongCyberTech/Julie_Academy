import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3Service } from 'src/resource/aws/aws-s3.service';
import { CloudinaryService } from 'src/resource/cloudinary/cloudinary.service';

@Injectable()
export class BackgroundService {
  constructor(
    private cloudinary: CloudinaryService,
    private s3: S3Service
  ){}

  @OnEvent('cloudinary.delete')
  async handleDeleteCloudinaryMedias(deletedMedias: string[]) {
    const extractPublicId = (url: string): string => {
      const regex = /\/v\d+\/([^\.]+)/;
      const match = url.match(regex);
      
      return match ? match[1] : null;
    };

    const publicIds = deletedMedias.map(item => extractPublicId(item))
    console.log(">> [CLOUDINARY DELETE ACTION]: ", publicIds)

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
}