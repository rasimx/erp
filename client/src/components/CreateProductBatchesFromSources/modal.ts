import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import omit from 'lodash/omit';
import { confirmDialog } from 'primereact/confirmdialog';

import { CREATE_PRODUCT_BATCHES_FROM_SOURCES_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchesFromSourcesDto } from '../../gql-types/graphql';
import withModal from '../withModal';
import Form from './form';
import {
  createProductBatchesFromSourcesValidationSchema,
  FormValues,
  Props,
} from './types';

const CreateProductBatchesFromSourcesForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchesFromSourcesValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as FormValues;
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
    confirmDialog({
      message: 'Вы уверены?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => {
        apolloClient
          .mutate({
            mutation: CREATE_PRODUCT_BATCHES_FROM_SOURCES_MUTATION,
            variables: { dto: values },
          })
          .then(result => {
            console.log(result);
            if (result.errors?.length) {
              alert('ERROR');
            } else {
              formikBag.props.closeModal();
              formikBag.props.onSubmit(
                values as CreateProductBatchesFromSourcesDto,
                formikBag as FormikBag<
                  Props,
                  CreateProductBatchesFromSourcesDto
                >,
              );
            }
          })
          .catch(err => {
            alert('ERROR');
          });
      },
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
