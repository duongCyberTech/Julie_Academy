import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BackgroundService } from './background-job.service';
import { QueueService } from './bull-queue.service';
import { QueueProcessor } from './bull-queue.processor';
import { ResourceModule } from 'src/resource/resource.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'system-tasks-queue',
    }),
    ResourceModule,
    NotificationsModule
  ],
  providers: [QueueService, QueueProcessor, BackgroundService],
  exports: [QueueService, BackgroundService],
})
export class BackgroundJobModule {}