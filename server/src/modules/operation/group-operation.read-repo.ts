import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupOperationReadEntity } from '@/operation/group-operation.read-entity.js';

export class GroupOperationReadRepo extends Repository<GroupOperationReadEntity> {
  async nextIds(count = 1): Promise<number[]> {
    const rows: { nextval: number }[] = await this.query(
      `SELECT nextval('operation_read_id_seq')::int FROM generate_series(1, ${count.toString()});`,
    );
    return rows.map(item => item.nextval);
  }
}

export const GroupOperationReadRepoProvider = {
  provide: GroupOperationReadRepo,
  inject: [getRepositoryToken(GroupOperationReadEntity)],
  useFactory: (repository: Repository<GroupOperationReadEntity>) => {
    return new GroupOperationReadRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
