import type { Metadata } from '@grpc/grpc-js';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

import { AppConfigService } from '@/config/app/config.service.js';
import { ContextService } from '@/context/context.service.js';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    private readonly contextService: ContextService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    if (context.getType() === 'rpc') {
      const metadata: Metadata = context.switchToRpc().getContext();

      return this.contextService.run(async () => {
        const userId = this.appConfigService.isDev
          ? 1
          : Number(metadata.get('userId')[0]);

        if (userId && !isNaN(userId)) {
          this.contextService.userId = userId;
        }

        return next.handle();
      });
    } else {
      const ctx = GqlExecutionContext.create(context);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const request = ctx.getContext().req;

      this.contextService.userId = this.appConfigService.isDev
        ? 1
        : request.user?.id;
      // todo: userId
      // this.contextService.userId = 1;

      return next.handle();
    }
  }
}
