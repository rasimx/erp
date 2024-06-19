import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class ExcludeAssetsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const excludedPathRegex = /^\/(assets|queues|graphql)\/?.?/;

    if (excludedPathRegex.test(req.url)) {
      next();
    } else {
      res.render('index', { message: 'Hello from controller!' });
    }
  }
}
