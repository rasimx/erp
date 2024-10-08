import { FormikProps } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { array, boolean, number, object, ObjectSchema, string } from 'yup';

import {
  CreateProductBatchesFromSourcesItemDto,
  CreateProductBatchesFromSourcesListDto,
} from '../../gql-types/graphql';

export type FormValues = CreateProductBatchesFromSourcesListDto & {
  grouped: boolean;
};
export type FormProps = FormikProps<FormValues>;

export interface Props {
  initialValues: Partial<FormValues>;
  closeModal: () => void;
  onSubmit: (
    values: CreateProductBatchesFromSourcesListDto,
    formikBag: FormikBag<Props, CreateProductBatchesFromSourcesListDto>,
  ) => Promise<unknown>;
}

export const createProductBatchesFromSourcesItemValidationSchema =
  (): ObjectSchema<CreateProductBatchesFromSourcesItemDto> =>
    object().shape({
      productId: number().required(),
      count: number().required(),
      sourceIds: array(number().required()).required(),
    });

export const createProductBatchesFromSourcesValidationSchema =
  (): ObjectSchema<CreateProductBatchesFromSourcesListDto> => {
    return object().shape({
      statusId: number().required(),
      groupId: number().nullable(),
      grouped: boolean().nullable(),
      groupName: string().when('grouped', ([grouped], schema) => {
        return grouped ? schema.required() : schema.nullable();
      }),
      items: array(
        createProductBatchesFromSourcesItemValidationSchema().required(),
      )
        .required()
        .min(1),
    });
  };
