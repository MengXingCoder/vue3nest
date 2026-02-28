import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取当前处理方法上的 roles 元数据
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有角色要求，直接放行
    if (!requiredRoles) {
      return true;
    }

    // 从请求中获取当前用户
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果用户不存在，拒绝访问
    if (!user) {
      return false;
    }
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}