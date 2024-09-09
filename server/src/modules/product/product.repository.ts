import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from './product.entity.js';

export class ProductRepository extends Repository<ProductEntity> {}

export const ProductRepositoryProvider = {
  provide: ProductRepository,
  inject: [getRepositoryToken(ProductEntity)],
  useFactory: (repository: Repository<ProductEntity>) => {
    return new ProductRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
