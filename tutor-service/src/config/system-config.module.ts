import { Module } from '@nestjs/common';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';

@Module({
  imports: [],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}