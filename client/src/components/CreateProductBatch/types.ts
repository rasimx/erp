import { FormikProps } from 'formik';
import { Nullable } from 'primereact/ts-helpers';
import { array, boolean, number, object, ObjectSchema, string } from 'yup';

import {
  CreateProductBatchItemDto,
  CreateProductBatchListDto,
} from '@/gql-types/graphql';

import { Product } from '../../api/product/product.gql';
import { DeepNullable } from '../../utils';

export interface FormState extends DeepNullable<CreateProductBatchListDto> {
  product?: Product | null;
}

export const createProductBatchItemValidationSchema =
  (): ObjectSchema<CreateProductBatchItemDto> => {
    return object().shape({
      count: number().required(),
      productId: number().required(),
      product: object(),
      costPricePerUnit: number().required(),
      currencyCostPricePerUnit: number().nullable(),
      operationsPricePerUnit: number().nullable(),
      operationsPrice: number().nullable(),
    });
  };

export const createProductBatchValidationSchema =
  (): ObjectSchema<CreateProductBatchListDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().required(),
      exchangeRate: number().nullable(),
      grouped: boolean().nullable(),
      groupName: string().when('grouped', ([grouped], schema) => {
        return grouped ? schema.required() : schema.nullable();
      }),
      items: array(createProductBatchItemValidationSchema()).required(),
    });
  };

export interface DataRow extends DeepNullable<CreateProductBatchItemDto> {
  product?: Nullable<Product>;
  index?: Nullable<number>;
}
export type DataRowKey = keyof DataRow;

export interface FormValues extends DeepNullable<CreateProductBatchListDto> {
  items?: Nullable<DataRow[]>;
}

export type FormProps = FormikProps<FormValues>;
