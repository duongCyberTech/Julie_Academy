import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParentOfStudentGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'parents') {
      // Để các role khác đi qua (RolesGuard đã chặn nếu cần)
      return true;
    }

    const childId: string | undefined =
      request.params?.child_id ?? request.query?.child_id;

    if (!childId) {
      throw new BadRequestException(
        'Thiếu child_id để xác thực quan hệ phụ huynh - học sinh',
      );
    }

    const relation = await this.prisma.is_family.findFirst({
      where: {
        parents_uid: user.userId,
        student_uid: childId,
      },
      select: { student_uid: true },
    });

    if (!relation) {
      throw new ForbiddenException(
        'Bạn không có quyền xem dữ liệu của học sinh này',
      );
    }

    return true;
  }
}