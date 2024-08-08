import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type FindOptionsWhere } from 'typeorm';

import type { Status } from '@/graphql.schema.js';
import { CreateStatusCommand } from '@/status/commands/impl/create-status.command.js';
import { MoveStatusCommand } from '@/status/commands/impl/move-status.command.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { MoveStatusDto } from '@/status/dtos/move-status.dto.js';
import { StatusDto } from '@/status/dtos/status.dto.js';
import { GetStatusListQuery } from '@/status/queries/impl/get-status-list.query.js';
import {
  StatusEntity,
  type StatusInsertEntity,
} from '@/status/status.entity.js';
import { StatusRepository } from '@/status/status.repository.js';

@Injectable()
export class StatusService {
  constructor(
    private readonly statusRepository: StatusRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async findById(id: number) {
    return this.statusRepository.findOneByOrFail({ id });
  }

  async find(where: FindOptionsWhere<StatusEntity>, relations: string[] = []) {
    return this.statusRepository.find({ where, relations });
  }

  async insert(data: StatusInsertEntity) {
    return this.statusRepository.insert(data);
  }

  async statusList2(): Promise<Status[]> {
    return this.statusRepository.find({ order: { order: 'ASC' } });
  }

  async createStatus(dto: CreateStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new CreateStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery([]));

    // await this.repository.save(input);
    // return this.statusList();
  }

  async deleteStatus(id: number): Promise<Status[]> {
    throw new Error('Not implemented');
    // todo: как быть при удалении не custom
    await this.statusRepository.delete({ id });
    // return this.statusList();
  }

  async moveStatus(dto: MoveStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new MoveStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery([]));
  }
}
