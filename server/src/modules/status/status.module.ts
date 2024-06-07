import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatusResolver } from '@/status/status.resolver.js';

import { StatusEntity } from './status.entity.js';
import { StatusService } from './status.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity])],
  providers: [StatusService, StatusResolver],
})
export class StatusModule {}
