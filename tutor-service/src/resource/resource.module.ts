import { Module } from "@nestjs/common";
import { ResourceController, FolderController } from "./resource.controller";
import { ResourceService, FolderService } from "./resource.service";
import { S3Service } from "./aws/aws-s3.service";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "src/prisma/prisma.module";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { CloudinaryProvider } from "./cloudinary/cloudinary.provider";
import { PdfService } from "./pdf/pdf.service";

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController, FolderController],
  providers: [
    ResourceService, 
    FolderService,
    S3Service, 
    ConfigService,
    CloudinaryService,
    CloudinaryProvider,
    PdfService
  ],
  exports: [CloudinaryService, S3Service, PdfService],
})
export class ResourceModule{}