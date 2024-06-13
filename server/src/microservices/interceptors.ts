import grpc, { type InterceptorOptions, type NextCall } from '@grpc/grpc-js';

import { ContextVarNotFound } from '@/context/context.exceptions.js';
import type { ContextService } from '@/context/context.service.js';

export const getContextInterceptor =
  (contextService: ContextService) =>
  (options: InterceptorOptions, nextCall: NextCall) => {
    const requester = new grpc.RequesterBuilder()
      .withStart((metadata, listener, next) => {
        try {
          const { userId } = contextService;
          if (userId) metadata.set('userID', userId.toString());
        } catch (e) {
          if (!(e instanceof ContextVarNotFound)) throw e;
        }
        next(metadata, listener);
      })
      .build();
    return new grpc.InterceptingCall(nextCall(options), requester);
  };
