import { FormikBag } from 'formik/dist/withFormik';

import {
  CreateProductBatchGroupDto,
  StatusFragment,
} from '../../gql-types/graphql';
import { FormValues as SelectProductBatchFormValues } from './SelectExistsProductBatchForm';

export type FormValues = Omit<
  CreateProductBatchGroupDto,
  'existProductBatchIds' | 'newProductBatches'
> & {
  existProductBatches: SelectProductBatchFormValues[];
  newProductBatches: CreateProductBatchFormValues[];
  newProductBatches: any[];
};

export type Props = {
  groupStatus: StatusFragment;
  closeModal: () => void;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
};
