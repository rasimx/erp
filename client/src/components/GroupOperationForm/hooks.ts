import { useCallback, useMemo } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
import { AddGroupOperationDto, ProportionType } from '../../gql-types/graphql';
import { toRouble } from '../../utils';
import { ProportionMap } from './GroupOperationFormContext';

export const useProportionMap = ({
  values,
  productBatches,
}: {
  values: AddGroupOperationDto;
  productBatches: ProductBatch[] | ProductBatchDetail[];
}) => {
  const percentages = useCallback(
    (type: ProportionType) => {
      const getTargetValue = (item: ProductBatch | ProductBatchDetail) => {
        switch (type) {
          case ProportionType.weight:
            return item.weight;
          case ProportionType.volume:
            return item.volume;
          case ProportionType.costPricePerUnit:
            return toRouble(item.costPricePerUnit);
          case ProportionType.costPrice:
            return toRouble(item.costPricePerUnit * item.count);
          default:
            alert('ERROR');
            throw new Error('ERROR');
        }
      };

      const totalSum = productBatches.reduce(
        (acc, item) => acc + getTargetValue(item),
        0,
      );

      const percentages = productBatches.map(item => ({
        ...item,
        proportion: Math.floor((getTargetValue(item) / totalSum) * 1000) / 10,
      }));

      const remainder =
        100 - percentages.reduce((acc, val) => acc + val.proportion, 0);

      percentages.sort((a, b) => b.proportion - a.proportion);

      if (remainder !== 0) {
        percentages[0].proportion = Number(
          (percentages[0].proportion + remainder).toFixed(2),
        );
      }

      percentages.sort((a, b) => a.id - b.id);
      return new Map(
        percentages.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: item.proportion,
            cost: toRouble(values.cost * item.proportion),
            value: getTargetValue(item),
          },
        ]),
      );
    },
    [productBatches, values.cost],
  );

  return useMemo<ProportionMap>(() => {
    return {
      [ProportionType.weight]: percentages(ProportionType.weight),
      [ProportionType.volume]: percentages(ProportionType.volume),
      [ProportionType.costPrice]: percentages(ProportionType.costPrice),
      [ProportionType.costPricePerUnit]: percentages(
        ProportionType.costPricePerUnit,
      ),
      [ProportionType.manual]: percentages(ProportionType.costPricePerUnit), // временно
      [ProportionType.equal]: new Map(
        productBatches.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: 100,
            cost: Number((values.cost * 100).toFixed(0)),
            value: values.cost,
          },
        ]),
      ), // временно
    };
  }, [percentages, values.cost]);
};
