import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { RequestEntity } from './request.entity.js';

export class RequestRepository extends Repository<RequestEntity> {
  async findLastNonRolledBackId(): Promise<string | null> {
    const rows: { id: string }[] = await this.manager.query(`
        select r1.id
        from request r1
                 left join request r2 on r1.id = r2.rollback_target_id
        where r2.id is null
          and r1.rollback_target_id is null
        order by r1.id DESC LIMIT 1;
    `);

    return rows.length ? rows[0].id : null;
  }

  async findLastRequest(): Promise<RequestEntity> {
    return this.findOneOrFail({
      where: { id: Not(IsNull()) },
      order: { id: 'DESC' },
    });
  }
}

export const RequestRepositoryProvider = {
  provide: RequestRepository,
  inject: [getRepositoryToken(RequestEntity)],
  useFactory: (repository: Repository<RequestEntity>) => {
    return new RequestRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
