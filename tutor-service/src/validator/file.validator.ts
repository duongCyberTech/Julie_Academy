import { FileValidator } from '@nestjs/common';

export class CustomFileValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file: Express.Multer.File): boolean {
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'mp3', 'mp4', 'mkv'];
    // Lấy đuôi file từ tên file
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }

  buildErrorMessage(): string {
    return 'Định dạng file không được hỗ trợ! Chỉ chấp nhận png, jpg, mp3, mp4, mkv.';
  }
}