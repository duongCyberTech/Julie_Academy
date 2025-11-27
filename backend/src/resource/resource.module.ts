import { Module } from "@nestjs/common";
import { ResourceController, FolderController } from "./resource.controller";
import { ResourceService, FolderService } from "./resource.service";
import { GoogleDriveService } from "./google/google.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController, FolderController],
  providers: [ResourceService, FolderService, GoogleDriveService],
  exports: [],
})
export class ResourceModule{}