import { FormikProps } from 'formik';
import pick from 'lodash/pick';
import { createContext, FC, ReactNode, useContext, useEffect } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
import { AddGroupOperationDto, ProportionType } from '../../gql-types/graphql';
import { useProportionMap } from './hooks';

export type ProportionValue = {
  productBatchId: number;
  proportion: number;
  cost: number;
  value: number;
};

export type ProportionMap = {
  [key in ProportionType]: Map<number, ProportionValue>;
};

export type OperationFormContextType = {
  proportionMap: ProportionMap;
};
export const GroupOperationFormContext =
  createContext<OperationFormContextType | null>(null);
export const useOperationFormContext = () =>
  useContext(GroupOperationFormContext);

export type Props = {
  productBatches: ProductBatch[] | ProductBatchDetail[];
  children: ReactNode;
};

export const OperationFormContextProvider: FC<
  Props & FormikProps<AddGroupOperationDto>
> = props => {
  const { children, productBatches, values, setFieldValue } = props;

  const proportionMap = useProportionMap({ productBatches, values });

  useEffect(() => {
    if (proportionMap && values.proportionType) {
      setFieldValue(
        'items',
        [...proportionMap[values.proportionType].values()].map(item =>
          pick(item, ['productBatchId', 'proportion', 'cost']),
        ),
      );
    }
  }, [proportionMap, values.proportionType]);

  return (
    <GroupOperationFormContext.Provider value={{ proportionMap }}>
      {children}
    </GroupOperationFormContext.Provider>
  );
};
