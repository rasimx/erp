import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { CustomDataSource } from '@/database/custom.data-source.js';
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

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly repository: Repository<StatusEntity>,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async findById(id: number) {
    return this.repository.findOneByOrFail({ id });
  }

  async find(where: FindOptionsWhere<StatusEntity>, relations: string[] = []) {
    return this.repository.find({ where, relations });
  }

  async insert(data: StatusInsertEntity) {
    return this.repository.insert(data);
  }

  async statusList2(): Promise<Status[]> {
    return this.repository.find({ order: { order: 'ASC' } });
  }

  async statusList(): Promise<StatusDto[]> {
    return this.queryBus.execute(new GetStatusListQuery());
  }

  async createStatus(dto: CreateStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new CreateStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery());

    // await this.repository.save(input);
    // return this.statusList();
  }

  async deleteStatus(id: number): Promise<Status[]> {
    throw new Error('Not implemented');
    // todo: как быть при удалении не custom
    await this.repository.delete({ id });
    return this.statusList();
  }

  async moveStatus(dto: MoveStatusDto): Promise<StatusDto[]> {
    await this.commandBus.execute(new MoveStatusCommand(dto));
    return this.queryBus.execute(new GetStatusListQuery());
  }
  async moveStatus2(id: number, newOrder: number): Promise<Status[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const status = await queryRunner.manager.findOneByOrFail(StatusEntity, {
        id,
      });
      const oldOrder = status.order;

      // await new Promise((resolve, reject) => setTimeout(reject, 2000));

      if (newOrder === status.order)
        throw new BadRequestException('order не поменялся');

      if (newOrder < oldOrder) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(StatusEntity)
          .set({ order: () => '"order" + 1' })
          .where(
            '"order" >= :newOrder AND "order" <= :oldOrder AND id != :id',
            {
              newOrder,
              oldOrder,
              id,
            },
          )
          .execute();
      } else {
        await queryRunner.manager
          .createQueryBuilder()
          .update(StatusEntity)
          .set({ order: () => '"order" - 1' })
          .where(
            '"order" >= :oldOrder AND "order" <= :newOrder AND id != :id',
            {
              oldOrder,
              newOrder,
              id,
            },
          )
          .execute();
      }

      status.order = newOrder;
      await queryRunner.manager.save(status);
      await queryRunner.commitTransaction();

      let query = this.repository.createQueryBuilder();
      if (newOrder < oldOrder) {
        query = query.where('"order" >= :newOrder AND "order" <= :oldOrder', {
          newOrder,
          oldOrder,
        });
      } else {
        query = query.where('"order" >= :oldOrder AND "order" <= :newOrder', {
          newOrder,
          oldOrder,
        });
      }

      return query.getMany();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
