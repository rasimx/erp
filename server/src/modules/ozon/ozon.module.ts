import { Module } from '@nestjs/common';
import { OzonService } from './ozon.service.js';

@Module({
  providers: [OzonService],
  exports: [OzonService],
})
export class OzonModule {}
