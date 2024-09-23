import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { FloatLabel } from 'primereact/floatlabel';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { type FC } from 'react';

import { EDIT_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import apolloClient from '../../apollo-client';
import withModal from '../withModal';
import classes from './EditProductBatchForm.module.scss';
import {
  editProductBatchValidationSchema,
  FormProps,
  FormValues,
} from './types';

export interface Props {
  closeModal: () => void;
  initialValues: Partial<FormValues>;
  onSubmit: (
    values: FormValues,
    formikBag: FormikBag<Props, FormValues>,
  ) => Promise<unknown>;
}

const Form: FC<Props & FormProps> = props => {
  const { handleSubmit, values, handleChange, handleBlur, errors } = props;

  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      className={classes.form}
    >
      <div className={classes.field}>
        <FloatLabel>
          <InputNumber
            required
            placeholder=" шт"
            suffix=" шт"
            maxFractionDigits={0}
            value={values.count}
            name="count"
            onValueChange={handleChange}
            onBlur={handleBlur}
            className={classes.input}
          />
          <label>Количество</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <FloatLabel>
          <InputTextarea
            value={values.reason}
            name="reason"
            onChange={handleChange}
            placeholder="Причина"
            onBlur={handleBlur}
            rows={5}
            cols={30}
          />
          <label>Причина</label>
        </FloatLabel>
      </div>

      <div className={classes.field}>
        <Button
          type="submit"
          // disabled={!newBathes.length}
        >
          Добавить
        </Button>
      </div>
    </form>
  );
};

export const EditProductBatchForm = withFormik<Props, FormValues>({
  validationSchema: () => editProductBatchValidationSchema(),
  mapPropsToValues: props => {
    return {
      ...props.initialValues,
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
            mutation: EDIT_PRODUCT_BATCH_MUTATION,
            variables: {
              dto: values,
            },
          })
          .then(result => {
            console.log(result);
            if (result.errors?.length) {
              alert('ERROR');
            } else {
              formikBag.props.closeModal();
              formikBag.props.onSubmit(values, formikBag);
            }
          })
          .catch(err => {
            alert('ERROR');
          });
      },
    });
  },
})(Form);

export const EditProductBatchModal = NiceModal.create(
  withModal(EditProductBatchForm, {
    header: 'Изменить партию',
  }),
);
