import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  IsNull,
} from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/product-batch-group.entity.js';

@EventSubscriber()
export class ProductBatchGroupEntitySubscriber
  implements EntitySubscriberInterface<ProductBatchGroupEntity>
{
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return ProductBatchGroupEntity;
  }

  /**
   * Called before post insertion.
   */
  async beforeInsert(event: InsertEvent<ProductBatchGroupEntity>) {
    if (!event.entity.order) {
      const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
      const lastUngroupedBatch = await event.queryRunner.manager.findOne(
        ProductBatchEntity,
        {
          where: { statusId: event.entity.statusId, groupId: IsNull() },
          order: { order: 'DESC' },
        },
      );
      if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

      const lastGroup = await event.queryRunner.manager.findOne(
        ProductBatchGroupEntity,
        {
          where: { statusId: event.entity.statusId },
          order: { order: 'DESC' },
        },
      );
      if (lastGroup) lastItems.push(lastGroup);

      event.entity.order = lastItems.length
        ? Math.max(...lastItems.map(({ order }) => order))
        : 1;
    }
  }
}
