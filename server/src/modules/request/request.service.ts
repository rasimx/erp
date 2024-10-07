import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestService {
  constructor(private readonly clsService: ClsService) {}
}
