import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RequestEntity } from './request.entity.js';

export class RequestRepository extends Repository<RequestEntity> {}

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
