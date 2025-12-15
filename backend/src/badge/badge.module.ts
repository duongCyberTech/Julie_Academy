import { Module } from "@nestjs/common";
import { BadgeService } from "./badge.service";
import { BadgeController } from "./badge.controller";

@Module({
  imports: [],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [],
})
export class BadgeModule{}