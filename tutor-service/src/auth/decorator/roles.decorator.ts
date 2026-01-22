import { SetMetadata } from '@nestjs/common';

// Định nghĩa khóa metadata
export const ROLES_KEY = 'roles';

// Decorator sử dụng: @Roles('admin', 'manager')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);