import { FormikProps } from 'formik';
import { number, object, ObjectSchema, string } from 'yup';

import { EditProductBatchDto } from '@/gql-types/graphql';

export const editProductBatchValidationSchema =
  (): ObjectSchema<EditProductBatchDto> => {
    return object().shape({
      id: number().required(),
      count: number().required(),
      reason: string().required(),
    });
  };

export type FormValues = EditProductBatchDto;
export type FormProps = FormikProps<FormValues>;
