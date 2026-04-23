import { Module } from "@nestjs/common";
import { ResourceController, FolderController } from "./resource.controller";
import { ResourceService, FolderService } from "./resource.service";
import { S3Service } from "./aws/aws-s3.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "src/prisma/prisma.module";
import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { CloudinaryProvider } from "./cloudinary/cloudinary.provider";

@Module({
  imports: [PrismaModule, ConfigModule], 
  controllers: [ResourceController, FolderController],
  providers: [
    ResourceService, 
    FolderService, 
    S3Service, 
    ConfigService,
    CloudinaryService,
    CloudinaryProvider
  ],
  exports: [CloudinaryService, S3Service],
})
export class ResourceModule{}