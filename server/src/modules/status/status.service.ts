import { BadRequestException, Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { CustomDataSource } from '@/database/custom.data-source.js';
import type { Status } from '@/graphql.schema.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
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

  async statusList(): Promise<Status[]> {
    return this.repository.find({ order: { order: 'ASC' } });
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

  async moveStatus(id: number, newOrder: number): Promise<Status[]> {
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
