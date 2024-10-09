import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupOperationEntity } from '@/operation/group-operation.entity.js';

export class GroupOperationRepository extends Repository<GroupOperationEntity> {}

export const GroupOperationRepositoryProvider = {
  provide: GroupOperationRepository,
  inject: [getRepositoryToken(GroupOperationEntity)],
  useFactory: (repository: Repository<GroupOperationEntity>) => {
    return new GroupOperationRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
