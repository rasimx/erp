import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const Cookie = createParamDecorator(
  (key: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return key && key in request.cookies
      ? request.cookies[key]
      : key
        ? null
        : request.cookies;
  },
);
