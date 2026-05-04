import { Module, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResourceModule } from 'src/resource/resource.module';

@Module({
  imports: [PrismaModule, ResourceModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
