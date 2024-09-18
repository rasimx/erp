import { FormikProps } from 'formik';
import pick from 'lodash/pick';
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
import { CreateOperationDto, ProportionType } from '../../gql-types/graphql';
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
export const OperationFormContext =
  createContext<OperationFormContextType | null>(null);
export const useOperationFormContext = () => useContext(OperationFormContext);

export type Props = {
  productBatches: ProductBatch[] | ProductBatchDetail[];
  children: ReactNode;
};

export const OperationFormContextProvider: FC<
  Props & FormikProps<CreateOperationDto>
> = props => {
  const { children, productBatches, values, setFieldValue } = props;

  const proportionMap = useProportionMap({ productBatches, values });

  useEffect(() => {
    if (proportionMap && values.proportionType) {
      setFieldValue(
        'productBatchProportions',
        [...proportionMap[values.proportionType].values()].map(item =>
          pick(item, ['productBatchId', 'proportion', 'cost']),
        ),
      );
    }
  }, [proportionMap, values.proportionType]);

  return (
    <OperationFormContext.Provider value={{ proportionMap }}>
      {children}
    </OperationFormContext.Provider>
  );
};
