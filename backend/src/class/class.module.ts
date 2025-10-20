import { Module } from '@nestjs/common';
import { ClassService, ScheduleService } from './class.service';
import { ClassController, ScheduleController } from './class.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassController, ScheduleController],
  providers: [ClassService, ScheduleService],
})
export class ClassModule {}
