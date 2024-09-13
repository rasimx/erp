import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';

import { CREATE_PRODUCT_BATCHES_BY_ASSEMBLING_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchesByAssemblingDto } from '../../gql-types/graphql';
import withModal from '../withModal';
import Form from './form';
import {
  createProductBatchesByAssemblingValidationSchema,
  FormValues,
  Props,
} from './types';

const CreateProductBatchesByAssemblingFormik = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchesByAssemblingValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as CreateProductBatchesByAssemblingDto;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<CreateProductBatchesByAssemblingDto> = {};
    // if (!values.email) {
    //   errors.email = 'Required';
    // } else if (!isValidEmail(values.email)) {
    //   errors.email = 'Invalid email address';
    // }
    return errors;
  },

  handleSubmit: (values, formikBag) => {
    apolloClient
      .mutate({
        mutation: CREATE_PRODUCT_BATCHES_BY_ASSEMBLING_MUTATION,
        variables: { dto: values as CreateProductBatchesByAssemblingDto },
      })
      .then(res => {})
      .catch(() => {
        alert('AAA');
      });
    // debugger;
    // return formikBag.props
    //   .onSubmit(
    //     { ...values, costPricePerUnit: fromRouble(values.costPricePerUnit) },
    //     formikBag,
    //   )
    //   .then(() => {
    //     formikBag.props.closeModal();
    //   });
  },
})(Form);

export const CreateProductBatchesByAssemblingModal = NiceModal.create(
  withModal(CreateProductBatchesByAssemblingFormik, {
    header: 'Собрать комбо-товары',
  }),
);