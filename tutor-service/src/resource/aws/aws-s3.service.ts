import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    const key = `${Date.now()}-${file.originalname}`; // Tạo tên file duy nhất

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // Mở dòng này nếu Bucket của bạn cho phép public access qua ACL
    });

    try {
      await this.s3Client.send(command);
      // Trả về URL của file sau khi upload thành công
      return {
        url: `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`,
        key: key
      };
    } catch (error) {
      return error.message
    }
  }

  async getFileStream(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  async deleteFiles(keys: string[] = []) {
    try {
      keys.forEach(async(key) => {
        const command = new DeleteObjectCommand({
          Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
          Key: key
        })

        await this.s3Client.send(command);
      })
    } catch (error) {
      console.log("Lỗi khi xóa file trên S3:", error);
    }
  }
}