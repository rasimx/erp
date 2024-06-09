import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import type { User } from '@/auth/interfaces.js';

export const CurrentUser = createParamDecorator(
  (
    key: keyof User | undefined,
    context: ExecutionContext,
  ): User | Partial<User> => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const a = request.user;
    // return key ? request.user[key] : request.user;
    const user = { id: 1 };
    return key ? user[key] : user;
  },
);
