export interface SetItem {
  productId: number;
  sku: string;
  qty: number;
}

export interface ProductSet {
  id: number;
  setItems: SetItem[];
}

export interface SourceItem {
  id: number;
  productId: number;
  count: number;
  selectedCount: number;
}

export interface AssembleItem {
  product: ProductSet;
  count: number;
  sources: SourceItem[];
}
type QtySourceItem = SourceItem & {
  qty: number;
  sku: string;
};

export interface ResultProductBatch {
  count: number;
  sources: QtySourceItem[];
}

export const assembleProduct = ({
  product,
  count,
  sources: originalSources,
}: AssembleItem): ResultProductBatch[] => {
  const sources = originalSources.map(source => ({ ...source }));
  if (!product.setItems.length)
    throw new Error(`Product ${product.id.toString()} is not Set`);

  const sourceBatchMapById = new Map(sources.map(item => [item.id, item]));

  if (
    product.setItems.filter(
      setItem =>
        setItem.qty * count !=
        sources
          .filter(item => {
            const batch = sourceBatchMapById.get(item.id);
            if (!batch) throw new Error('qqqq');
            if (item.selectedCount > batch.count)
              throw new Error('превышено доступное количество');
            return batch.productId == setItem.productId;
          })
          .reduce((prev, cur) => prev + cur.selectedCount, 0),
    ).length
  ) {
    throw new Error(`count error`);
  }

  const sourceBatchMapByProductId = new Map<number, SourceItem[]>();
  sources.forEach(item => {
    const mapItem = sourceBatchMapByProductId.get(item.productId) ?? [];
    mapItem.push(item);
    sourceBatchMapByProductId.set(item.productId, mapItem);
  });

  const entities: {
    count: number;
    sources: QtySourceItem[];
  }[] = [];
  const remains = new Map<number, QtySourceItem[]>();
  for (;;) {
    const items: QtySourceItem[] = [];

    product.setItems.forEach(setItem => {
      let sources = sourceBatchMapByProductId.get(setItem.productId);
      if (!sources)
        throw new Error(
          `not found source batches for ${setItem.productId.toString()}`,
        );

      sources = sources.filter(item => item.selectedCount > 0);
      if (sources.length > 0) {
        items.push({
          ...sources.toSorted((a, b) => b.selectedCount - a.selectedCount)[0],
          qty: setItem.qty,
          sku: setItem.sku,
        });
      }
    });
    if (product.setItems.length == items.length) {
      items.sort((a, b) => a.selectedCount / a.qty - b.selectedCount / b.qty);
      const minItem = items[0];
      const itemCount = Math.floor(minItem.selectedCount / minItem.qty);
      if (itemCount > 0) {
        entities.push({
          count: itemCount,
          sources: items.map(item => ({
            ...item,
            selectedCount: item.qty * itemCount,
          })),
        });
        items.forEach(item => {
          item.selectedCount -= itemCount * item.qty;
          const original = sourceBatchMapById.get(item.id);
          if (original) original.selectedCount -= itemCount * item.qty;
        });
      }

      if (minItem.selectedCount % minItem.qty) {
        const remainsMapItem = remains.get(minItem.productId) ?? [];
        remainsMapItem.push({ ...minItem, qty: minItem.qty });
        remains.set(minItem.productId, remainsMapItem);
        minItem.selectedCount = 0;
        const original = sourceBatchMapById.get(minItem.id);
        if (original) {
          original.selectedCount = 0;
        } else {
          throw new Error(
            `not found source batches for ${minItem.id.toString()}`,
          );
        }
      }
      if (
        ![...sourceBatchMapById.values()].filter(item => item.selectedCount > 0)
          .length
      )
        break;
    } else {
      items.forEach(item => {
        const remainsMapItem = remains.get(item.productId) ?? [];
        remainsMapItem.push({ ...item, qty: item.qty });
        remains.set(item.productId, remainsMapItem);
      });
      break;
    }
  }
  while (remains.size > 0) {
    const remainEntities: QtySourceItem[] = [];
    product.setItems.forEach(setItem => {
      const list = remains.get(setItem.productId);
      if (!list) throw new Error('aaaa');

      const selectedItems: SourceItem[] = [];
      while (
        selectedItems.reduce((prev, cur) => prev + cur.selectedCount, 0) <
        setItem.qty
      ) {
        const a = list.shift();
        if (a) selectedItems.push(a);
        else break;
      }
      remainEntities.push(
        ...selectedItems.map(item => ({
          ...item,
          qty: setItem.qty,
          sku: setItem.sku,
        })),
      );
      if (list.length == 0) {
        remains.delete(setItem.productId);
      }
    });

    entities.push({
      count: 1,
      sources: remainEntities,
    });
  }
  return entities;
};
