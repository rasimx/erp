import type { Metadata } from '@grpc/grpc-js';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { mergeMap, Observable } from 'rxjs';

import { ContextService } from '@/context/context.service.js';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const metadata: Metadata = context.switchToRpc().getContext();

      return new Observable(subscriber => {
        this.contextService.run(() => {
          this.contextService.userId = metadata.get('userId')[0].toString();

          // next.handle().pipe().subscribe(subscriber);
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

      // this.contextService.userId = request.user?.id;
      // todo: userId
      this.contextService.userId = 1;

      return next.handle().pipe(mergeMap(() => next.handle()));
    }
  }
}
