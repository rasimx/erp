import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Status } from '@/graphql.schema.js';
import {
  StatusEntity,
  type StatusInsertEntity,
  StatusType,
} from '@/status/status.entity.js';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly repository: Repository<StatusEntity>,
  ) {}

  async insert(data: StatusInsertEntity) {
    return this.repository.insert(data);
  }

  async statusList(): Promise<Status[]> {
    return this.repository.find();
  }

  async createStatus(input: StatusInsertEntity): Promise<Status[]> {
    await this.repository.save(input);
    return this.statusList();
  }

  async deleteStatus(id: number): Promise<Status[]> {
    throw new Error('Not implemented');
    // todo: как быть при удалении не custom
    await this.repository.delete({ id });
    return this.statusList();
  }

  async findByStoreId(storeId: number, type: StatusType): Promise<Status> {
    return this.repository.findOneOrFail({ where: { storeId, type } });
  }
}
