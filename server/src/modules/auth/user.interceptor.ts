import type { Metadata } from '@grpc/grpc-js';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClsService } from 'nestjs-cls';
import { defer, mergeMap, Observable } from 'rxjs';

import { USER_ID } from '@/auth/auth.constants.js';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const metadata: Metadata = context.switchToRpc().getContext();

      return new Observable(subscriber => {
        this.cls.run(() => {
          const userId = metadata.get('userId')[0];
          if (userId) this.cls.set(USER_ID, Number(userId));

          next
            .handle()
            .pipe()
            .subscribe({
              next: res => {
                subscriber.next(res);
              },
              error: err => {
                subscriber.error(err);
              },
              complete: () => {
                subscriber.complete();
              },
            });
        });
      });
    } else {
      const ctx = GqlExecutionContext.create(context);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const request = ctx.getContext().req;
      return defer(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = request.user?.id;
        this.cls.set(USER_ID, userId);
      }).pipe(mergeMap(() => next.handle()));
    }
  }
}
