import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadMultiMediaFiles(tx: Prisma.TransactionClient, tutor_id: string, title: string, files: Array<Express.Multer.File>) {
    const uploadPromises = files.map(file => this.uploadFile(file));
    const results = await Promise.all(uploadPromises);

    const resImages = await tx.resources.createManyAndReturn({
      data: results.map((img, idx) => {
        return {
          title: img.original_filename,
          description: title + ` image ${idx}`,
          file_type: img.resource_type,
          file_path: img.secure_url,
          version: 1,
          num_pages: img.bytes,
          user_id: tutor_id
        }
      })
    })

    return resImages.map(img => img.did)
  }
  
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', 
          folder: 'threads', 
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFiles(publicIds: string[]) {
    const failure: string[] = []
    const success: string[] = []

    publicIds.forEach((publicId) => {
      try {
        cloudinary.uploader.destroy(publicId)
        success.push(publicId)
      } catch (error) {
        failure.push(publicId)
      }
    })

    return { fnum: failure.length, snum: success.length }
  }
}