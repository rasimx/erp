import { FormikProps } from 'formik';
import { number, object, ObjectSchema } from 'yup';

import {
  CreateProductBatchDto,
  CreateProductBatchesByAssemblingDto,
} from '@/gql-types/graphql';

import { Product } from '../../api/product/product.gql';
import { RecursiveNullable } from '../../utils';

export interface FormState
  extends Partial<RecursiveNullable<CreateProductBatchDto>> {
  product?: Product | null;
}

export const createProductBatchValidationSchema =
  (): ObjectSchema<CreateProductBatchDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().nullable(),
      count: number().required(),
      productId: number().required(),
      costPricePerUnit: number().required(),
      operationsPricePerUnit: number(),
      operationsPrice: number(),
    });
  };

export type FormValues = Partial<RecursiveNullable<CreateProductBatchDto>>;
export type FormProps = FormikProps<FormValues>;
