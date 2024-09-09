import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { array, number, object, ObjectSchema, string } from 'yup';

import withModal from '../withModal';
import Form from './form';
import { selectProductBatchValidationSchema } from './SelectExistsProductBatchForm';
import { FormValues, Props } from './types';

export const ProductBatchGroupForm = withFormik<Props, FormValues>({
  validationSchema: () => {
    // @ts-expect-error здесь не нужна особая проверка existProductBatches. главное не null
    const schema: ObjectSchema<FormValues> = object({
      name: string().required(),
      statusId: number().required(),
      existProductBatches: array(
        selectProductBatchValidationSchema(),
      ).required(),
      // newProductBatches: array(createProductBatchValidationSchema()).required(),
    });
    return schema;
  },
  mapPropsToValues: props => {
    return {
      name: '',
      statusId: props.groupStatus.id,
      existProductBatches: [],
      newProductBatches: [],
    } as FormValues;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: async (values, formikBag) => {
    return formikBag.props.onSubmit(values, formikBag);
  },
})(Form);

export const ProductBatchGroupModal = NiceModal.create(
  withModal(ProductBatchGroupForm, { header: 'Добавить группу товаров' }),
);
