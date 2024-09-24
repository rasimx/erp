import { FormikProps } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { array, boolean, number, object, ObjectSchema, string } from 'yup';

import {
  CreateProductBatchesFromSourcesDto,
  SourceProductBatchDto,
} from '../../gql-types/graphql';

export type FormValues = CreateProductBatchesFromSourcesDto & {
  grouped: boolean;
};
export type FormProps = FormikProps<FormValues>;

export interface Props {
  initialValues: Partial<FormValues>;
  closeModal: () => void;
  onSubmit: (
    values: CreateProductBatchesFromSourcesDto,
    formikBag: FormikBag<Props, CreateProductBatchesFromSourcesDto>,
  ) => Promise<unknown>;
}

export const SourceProductBatchValidationSchema: ObjectSchema<SourceProductBatchDto> =
  object().shape({
    id: number().required(),
    productId: number().required(),
    selectedCount: number().required(),
  });

export const createProductBatchesFromSourcesValidationSchema =
  (): ObjectSchema<CreateProductBatchesFromSourcesDto> => {
    return object().shape({
      groupId: number().nullable(),
      statusId: number().nullable(),
      grouped: boolean().nullable(),
      groupName: string().when('grouped', ([grouped], schema) => {
        return grouped ? schema.required() : schema.nullable();
      }),
      sources: array(SourceProductBatchValidationSchema.required()).required(),
    });
  };
