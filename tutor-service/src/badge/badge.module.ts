import { Module } from "@nestjs/common";
import { BadgeService } from "./badge.service";
import { BadgeController } from "./badge.controller";
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";
import { BadgeGateway } from "./badge.gateway";

@Module({
  imports: [],
  controllers: [BadgeController],
  providers: [BadgeService, CloudinaryService, BadgeGateway],
  exports: [BadgeGateway, BadgeService],
})
export class BadgeModule{}