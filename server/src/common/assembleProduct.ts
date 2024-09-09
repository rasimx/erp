export interface ProductBatch {
  id: number;
  productId: number;
  count: number;
  costPricePerUnit: number;
  operationsPricePerUnit: number;
  product: { id: number; name: string; sku: string };
}

export interface SetItem {
  setId: number;
  productId: number;
  qty: number;
}

export interface ProductSet {
  id: number;
  setItems: SetItem[];
}

export interface SourceItem {
  id: number;
  selectedCount: number;
}

export interface AssembleItem {
  productSet: ProductSet;
  fullCount: number;
  sources: SourceItem[];
  productBatches: ProductBatch[];
}

export interface ResultProductBatch {
  count: number;
  sources: {
    selectedCount: number;
    productBatch: ProductBatch;
    qty: number;
  }[];
}

export const assembleProduct = ({
  productSet,
  fullCount,
  sources,
  productBatches,
}: AssembleItem): ResultProductBatch[] => {
  if (!productSet.setItems.length)
    throw new Error(`Product ${productSet.id.toString()} is not Set`);

  const sourceBatchMapById = new Map(
    productBatches.map(item => [item.id, item]),
  );

  if (
    productSet.setItems.filter(
      setItem =>
        setItem.qty * fullCount !=
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

  const sourceBatchMap = new Map<
    number,
    {
      selectedCount: number;
      productBatch: ProductBatch;
    }[]
  >();
  sources.forEach(({ id, selectedCount }) => {
    const productBatch = sourceBatchMapById.get(id);
    if (!productBatch) throw new Error(`sourceId ${id.toString()} not found`);

    const mapItem = sourceBatchMap.get(productBatch.productId) ?? [];
    mapItem.push({
      selectedCount,
      productBatch,
    });
    sourceBatchMap.set(productBatch.productId, mapItem);
  });

  const entities: {
    count: number;
    sources: {
      selectedCount: number;
      productBatch: ProductBatch;
      qty: number;
    }[];
  }[] = [];
  const remains = new Map<
    number,
    { selectedCount: number; productBatch: ProductBatch; qty: number }[]
  >();
  for (;;) {
    const items: {
      qty: number;
      source: { selectedCount: number; productBatch: ProductBatch };
    }[] = [];

    productSet.setItems.forEach(setItem => {
      let sources = sourceBatchMap.get(setItem.productId);
      if (!sources)
        throw new Error(
          `not found source batches for ${setItem.productId.toString()}`,
        );

      sources = sources.filter(item => item.selectedCount > 0);
      if (sources.length > 0) {
        items.push({
          qty: setItem.qty,
          source: sources.toSorted(
            (a, b) => b.selectedCount - a.selectedCount,
          )[0],
        });
        sourceBatchMap.set(setItem.productId, sources);
      }
    });
    if (productSet.setItems.length == items.length) {
      items.sort(
        (a, b) =>
          a.source.selectedCount / a.qty - b.source.selectedCount / b.qty,
      );
      const minItem = items[0];
      const itemCount = Math.floor(minItem.source.selectedCount / minItem.qty);
      if (itemCount > 0) {
        entities.push({
          count: itemCount,
          sources: items.map(({ qty, source }) => ({
            selectedCount: qty * itemCount,
            productBatch: source.productBatch,
            qty,
          })),
        });
        items.forEach(item => {
          item.source.selectedCount -= itemCount * item.qty;
        });
      }

      if (minItem.source.selectedCount % minItem.qty) {
        const remainsMapItem =
          remains.get(minItem.source.productBatch.productId) ?? [];
        remainsMapItem.push({ ...minItem.source, qty: minItem.qty });
        remains.set(minItem.source.productBatch.productId, remainsMapItem);
        minItem.source.selectedCount = 0;
      }
      if (
        ![...sourceBatchMap.values()].filter(
          item => !!item.filter(item => item.selectedCount > 0).length,
        ).length
      )
        break;
    } else {
      items.forEach(item => {
        const remainsMapItem =
          remains.get(item.source.productBatch.productId) ?? [];
        remainsMapItem.push({ ...item.source, qty: item.qty });
        remains.set(item.source.productBatch.productId, remainsMapItem);
      });
      break;
    }
  }
  while (remains.size > 0) {
    const remainEntities: {
      selectedCount: number;
      productBatch: ProductBatch;
      qty: number;
    }[] = [];
    productSet.setItems.forEach(setItem => {
      const list = remains.get(setItem.productId);
      if (!list) throw new Error('aaaa');

      const selectedItems: {
        selectedCount: number;
        productBatch: ProductBatch;
        qty: number;
      }[] = [];
      while (
        selectedItems.reduce((prev, cur) => prev + cur.selectedCount, 0) <
        setItem.qty
      ) {
        const a = list.shift();
        if (a) selectedItems.push(a);
        else break;
      }
      remainEntities.push(...selectedItems);
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
