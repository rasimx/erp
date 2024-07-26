import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type FindOptionsWhere, In, Repository } from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { MoveStatusDto } from '@/status/dtos/move-status.dto.js';
import { StatusEntity } from '@/status/status.entity.js';

export class StatusRepository extends Repository<StatusEntity> {
  createFromDto(dto: CreateStatusDto) {
    const entity = new StatusEntity();
    entity.userId = 1;
    Object.assign(entity, dto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.save(entity);
  }
  async moveStatus(dto: MoveStatusDto): Promise<StatusEntity> {
    const { id, order: newOrder } = dto;
    const status = await this.findOneByOrFail({
      id,
    });
    const oldOrder = status.order;

    if (newOrder === status.order)
      throw new BadRequestException('order не поменялся');

    if (newOrder < oldOrder) {
      await this.manager
        .createQueryBuilder()
        .update(StatusEntity)
        .set({ order: () => '"order" + 1' })
        .where('"order" >= :newOrder AND "order" <= :oldOrder AND id != :id', {
          newOrder,
          oldOrder,
          id,
        })
        .execute();
    } else {
      await this.manager
        .createQueryBuilder()
        .update(StatusEntity)
        .set({ order: () => '"order" - 1' })
        .where('"order" >= :oldOrder AND "order" <= :newOrder AND id != :id', {
          oldOrder,
          newOrder,
          id,
        })
        .execute();
    }

    status.order = newOrder;
    return this.save(status);
  }

  statusList(ids: number[]) {
    const where: FindOptionsWhere<StatusEntity> = {};
    if (ids.length) where.id = In(ids);
    return this.find({ where });
  }

  async findByStoreId(storeIds: number[]): Promise<StatusEntity[]> {
    return this.find({ where: { storeId: In(storeIds) } });
  }
}

export const StatusRepositoryProvider = {
  provide: StatusRepository,
  inject: [getRepositoryToken(StatusEntity)],
  useFactory: (repository: Repository<StatusEntity>) => {
    return new StatusRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
