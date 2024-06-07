import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Status } from '@/graphql.schema.js';
import {
  type StateInsertEntity,
  StatusEntity,
} from '@/status/status.entity.js';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly repository: Repository<StatusEntity>,
  ) {}

  async insert(data: StateInsertEntity) {
    return this.repository.insert(data);
  }

  async statusList(): Promise<Status[]> {
    return this.repository.find();
  }

  async createStatus(title: string): Promise<Status[]> {
    const newStatus = new StatusEntity();
    newStatus.title = title;
    await this.repository.save(newStatus);
    return this.statusList();
  }
  async deleteStatus(id: number): Promise<Status[]> {
    await this.repository.delete({ id });
    return this.statusList();
  }
}
