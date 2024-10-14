import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  type FindOptionsWhere,
  In,
  IsNull,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { StatusReadEntity } from '@/status/domain/status.read-entity.js';
import type { CreateStatusDto } from '@/status/dtos/create-status.dto.js';
import type { MoveStatusDto } from '@/status/dtos/move-status.dto.js';

export class StatusReadRepo extends Repository<StatusReadEntity> {
  async nextId(): Promise<number> {
    const a: { nextval: number }[] = await this.query(
      "SELECT nextval('status_id_seq')",
    );
    return Number(a[0].nextval);
  }

  async getLastOrder(): Promise<number | null> {
    return this.findOne({
      select: ['order'],
      order: { order: 'desc' },
    }).then(row => row?.order ?? null);
  }

  async getIdsMoreThanOrEqualOrder(order: number) {
    const rows = await this.find({
      select: ['id'],
      where: {
        order: MoreThanOrEqual(order),
      },
      order: { order: 'ASC' },
    });
    return rows.map(({ id }) => id);
  }

  async createFromDto(dto: CreateStatusDto) {
    const lastStatus = await this.findOne({
      where: { id: Not(IsNull()) },
      order: { order: 'DESC' },
    });

    const entity = new StatusReadEntity();
    entity.userId = 1;
    entity.order = lastStatus ? lastStatus.order + 1 : 1;
    Object.assign(entity, dto);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.save(entity);
  }
  async moveStatus(dto: MoveStatusDto): Promise<StatusReadEntity> {
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
        .update(StatusReadEntity)
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
        .update(StatusReadEntity)
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
    const where: FindOptionsWhere<StatusReadEntity> = {};
    if (ids.length) where.id = In(ids);
    return this.find({ where });
  }

  async findByStoreId(storeIds: number[]): Promise<StatusReadEntity[]> {
    return this.find({ where: { storeId: In(storeIds) } });
  }
}

export const StatusRepositoryProvider = {
  provide: StatusReadRepo,
  inject: [getRepositoryToken(StatusReadEntity)],
  useFactory: (repository: Repository<StatusReadEntity>) => {
    return new StatusReadRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
