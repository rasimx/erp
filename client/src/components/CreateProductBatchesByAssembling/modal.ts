import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { confirmDialog } from 'primereact/confirmdialog';

import { CREATE_PRODUCT_BATCHES_FROM_SOURCES_LIST_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import { CreateProductBatchesFromSourcesListDto } from '../../gql-types/graphql';
import { createProductBatchesFromSourcesValidationSchema } from '../CreateProductBatchesFromSources/types';
import withModal from '../withModal';
import Form from './form';
import { FormValues, Props } from './types';

const CreateProductBatchesByAssemblingFormik = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchesFromSourcesValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
    } as CreateProductBatchesFromSourcesListDto;
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    const errors: FormikErrors<CreateProductBatchesFromSourcesListDto> = {};
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
            mutation: CREATE_PRODUCT_BATCHES_FROM_SOURCES_LIST_MUTATION,
            variables: {
              dto: values as CreateProductBatchesFromSourcesListDto,
            },
          })
          .then(result => {
            console.log(result);
            if (result.errors?.length) {
              alert('ERROR');
            } else {
              formikBag.props.closeModal();
              formikBag.props.onSubmit(
                values as CreateProductBatchesFromSourcesListDto,
                formikBag as FormikBag<
                  Props,
                  CreateProductBatchesFromSourcesListDto
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

export const CreateProductBatchesByAssemblingModal = NiceModal.create(
  withModal(CreateProductBatchesByAssemblingFormik, {
    header: 'Собрать комбо-товары',
  }),
);
