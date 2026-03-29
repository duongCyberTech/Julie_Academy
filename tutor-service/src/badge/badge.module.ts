import { Module } from "@nestjs/common";
import { BadgeService } from "./badge.service";
import { BadgeController } from "./badge.controller";
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";

@Module({
  imports: [],
  controllers: [BadgeController],
  providers: [BadgeService, CloudinaryService],
  exports: [],
})
export class BadgeModule{}