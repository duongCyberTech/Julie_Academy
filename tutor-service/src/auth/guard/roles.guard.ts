// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy metadata (các vai trò được yêu cầu) từ route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), // kiểm tra method handler
      context.getClass(),   // kiểm tra class (Controller)
    ]);

    // Nếu không có yêu cầu vai trò, cho phép truy cập
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin người dùng từ request (đã được JWT Guard gán vào)
    // Giả sử req.user có property 'role'
    const { user } = context.switchToHttp().getRequest();
    console.log(user)
    
    // 3. Kiểm tra xem vai trò của người dùng có nằm trong requiredRoles không
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}