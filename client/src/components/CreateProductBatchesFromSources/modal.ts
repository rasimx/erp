import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';

import { CREATE_PRODUCT_BATCHES_FROM_SOURCES_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchesFromSourcesDto } from '../../gql-types/graphql';
import withModal from '../withModal';
import Form from './form';
import {
  createProductBatchesByAssemblingValidationSchema,
  FormValues,
  Props,
} from './types';

const CreateProductBatchesFromSourcesForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchesByAssemblingValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as CreateProductBatchesFromSourcesDto;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<CreateProductBatchesFromSourcesDto> = {};
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
        mutation: CREATE_PRODUCT_BATCHES_FROM_SOURCES_MUTATION,
        variables: { dto: values as CreateProductBatchesFromSourcesDto },
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

export const CreateProductBatchesFromSourcesModal = NiceModal.create(
  withModal(CreateProductBatchesFromSourcesForm, {
    header: 'Перенос товаров',
  }),
);
