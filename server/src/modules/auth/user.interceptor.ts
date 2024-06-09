import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClsService } from 'nestjs-cls';
import { defer, mergeMap, type Observable } from 'rxjs';

import { USER_ID } from '@/auth/auth.constants.js';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return defer(async () => {
      // const userId = request.user?.id;
      const userId: number | undefined = 2;
      this.cls.set(USER_ID, userId);
    }).pipe(mergeMap(() => next.handle()));
  }
}
