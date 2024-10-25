import { getRepositoryToken } from '@nestjs/typeorm';
import { type FindOptionsWhere, In, Repository } from 'typeorm';

import type { ProductListDto } from '@/product/dtos/product-list.dto.js';

import { ProductReadEntity } from './product.read-entity.js';

export class ProductReadRepo extends Repository<ProductReadEntity> {
  async nextIds(count = 1): Promise<number[]> {
    const rows: { nextval: number }[] = await this.query(
      `SELECT nextval('product_id_seq')::int FROM generate_series(1, ${count.toString()});`,
    );
    return rows.map(item => item.nextval);
  }
  async productList(ids: number[] = []): Promise<ProductListDto> {
    const where: FindOptionsWhere<ProductReadEntity> = {};
    if (ids.length) {
      where.id = In(ids);
    }
    const [items, totalCount] = await this.findAndCount({
      where,
      relations: ['setItems', 'setItems.product'],
    });
    return {
      items: items.map(item => ({
        ...item,
        setItems: item.setItems.map(setItem => ({
          ...setItem,
          ...setItem.product,
        })),
      })),
      totalCount,
    };
  }

  async productSetList(): Promise<ProductListDto> {
    const [items, totalCount] = await this.createQueryBuilder('p')
      .leftJoinAndSelect('p.setItems', 'setItems')
      .leftJoinAndSelect('setItems.product', 'setItemsProduct')
      .where('setItems.id is not null')
      .getManyAndCount();

    return {
      items: items.map(item => ({
        ...item,
        setItems: item.setItems.map(setItem => ({
          ...setItem,
          ...setItem.product,
        })),
      })),
      totalCount,
    };
  }
}

export const ProductRepositoryProvider = {
  provide: ProductReadRepo,
  inject: [getRepositoryToken(ProductReadEntity)],
  useFactory: (repository: Repository<ProductReadEntity>) => {
    return new ProductReadRepo(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
