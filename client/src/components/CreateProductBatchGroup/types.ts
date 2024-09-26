import { FormikProps } from 'formik';
import { array, number, object, ObjectSchema, string } from 'yup';

import { CreateProductBatchGroupDto } from '@/gql-types/graphql';

import { DeepNullable } from '../../utils';

export const createProductBatchGroupValidationSchema =
  (): ObjectSchema<CreateProductBatchGroupDto> => {
    return object().shape({
      statusId: number().required(),
      existProductBatchIds: array(number().required()).required(),
      name: string().required(),
      // newProductBatches: string().required(),
    });
  };

export type FormValues = DeepNullable<CreateProductBatchGroupDto>;
export type FormProps = FormikProps<FormValues>;
