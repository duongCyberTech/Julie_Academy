import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  // Đổi thành public và đổi tên thành client để ResourceService có thể truy cập
  public client: S3Client;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    
    // Tối ưu: Xóa khoảng trắng và ký tự đặc biệt trong tên file để tránh lỗi URL
    const safeOriginalName = file.originalname.replace(/\s+/g, '_');
    const key = `${Date.now()}-${safeOriginalName}`; 

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.client.send(command);
      return {
        id: key, // Thêm id để tương thích với `fileUploaded.id` bên ResourceService
        url: `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`,
        key: key
      };
    } catch (error) {
      // Nên throw Error để Controller bắt được, thay vì return chuỗi text
      throw new InternalServerErrorException('Lỗi khi upload file lên S3: ' + error.message);
    }
  }

  async getFileStream(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: key,
    });

    return await this.client.send(command);
  }

  async deleteFiles(keys: string[] = []) {
    try {
      // Tối ưu: Dùng Promise.all thay vì forEach để chạy song song và bắt lỗi chuẩn xác
      await Promise.all(
        keys.map((key) => {
          const command = new DeleteObjectCommand({
            Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
            Key: key
          });
          return this.client.send(command);
        })
      );
    } catch (error) {
      console.error("Lỗi khi xóa file trên S3:", error);
      throw new InternalServerErrorException("Không thể xóa file vật lý trên S3");
    }
  }
}