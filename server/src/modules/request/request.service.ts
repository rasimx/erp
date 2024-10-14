import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { RequestRepository } from '@/request/request.repository.js';

@Injectable()
export class RequestService {
  constructor(
    private readonly clsService: ClsService,
    private readonly requestRepo: RequestRepository,
  ) {}
}
