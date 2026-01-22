import { Module } from "@nestjs/common";
import { ResourceController, FolderController } from "./resource.controller";
import { ResourceService, FolderService } from "./resource.service";
import { GoogleDriveService } from "./google/google.service";
import { S3Service } from "./aws/aws-s3.service";
import { DriveGateway } from "./socket/drive.socket";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController, FolderController],
  providers: [
    ResourceService, FolderService, GoogleDriveService, 
    DriveGateway, S3Service, ConfigService
  ],
  exports: [],
})
export class ResourceModule{}