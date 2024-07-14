import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ClsContextOptions } from 'nestjs-cls/dist/src/lib/cls.options.js';

import { ContextVarNotFound } from '@/context/context.exceptions.js';

import { USER_ID } from './context.constants.js';

@Injectable()
export class ContextService {
  constructor(private readonly clsService: ClsService) {}

  get requestId(): string {
    return this.clsService.getId();
  }
  get userId(): number {
    const userId = this.clsService.get(USER_ID);
    if (!userId) throw new ContextVarNotFound('user id not found');
    return userId;
  }
  set userId(value: number | string) {
    const userId = Number(value);
    if (!userId || isNaN(userId)) throw new Error('userId not a number');
    this.clsService.set(USER_ID, userId);
  }

  run<T = unknown>(callback: () => T): T;
  run<T = unknown>(options: ClsContextOptions, callback: () => T): T;
  run<T = unknown>(x: unknown, y?: () => T): T {
    if (y) {
      return this.clsService.run<T>(x as ClsContextOptions, y);
    } else return this.clsService.run<T>(x as () => T);
  }
}
