import { Module } from "@nestjs/common";
import { NotificationGateway } from "./notifications.gateway";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [
    NotificationGateway,
    NotificationsService
  ],
  exports: [
    NotificationGateway,
    NotificationsService
  ]
})
export class NotificationsModule {}