import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

import { isPublic } from '@/common/decorators/public.decorator.js';

@Injectable()
export class JwtGrpcGuard extends AuthGuard('jwt-grpc') implements CanActivate {
  // export class JwtGrpcGuard extends AuthGuard('jwt-grpc') {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    return context.switchToRpc().getContext();
  }

  canActivate(ctx: ExecutionContext) {
    const _isPublic = isPublic(ctx, this.reflector);
    if (_isPublic) {
      return true;
    }
    return super.canActivate(ctx);
  }
}
