import NiceModal from '@ebay/nice-modal-react';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';

import { CREATE_PRODUCT_BATCH_GROUP_MUTATION } from '../../api/product-batch-group/product-batch-group.gql';
import { useStatusList } from '../../api/status/status.hooks';
import apolloClient from '../../apollo-client';
import {
  CreateProductBatchGroupDto,
  type StatusDto,
} from '../../gql-types/graphql';
import { useAppSelector } from '../../hooks';
import StatusSelect from '../Autocomplete/StatusSelect';
import { selectSelectedProductBatches } from '../ProductBatchPage/product-batch-page.slice';
import withModal from '../withModal';
import {
  createProductBatchGroupValidationSchema,
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
  const {
    handleSubmit,
    handleBlur,
    handleChange,
    setFieldValue,
    values,
    errors,
  } = props;

  const selectedProductBathes = useAppSelector(selectSelectedProductBatches);

  console.log(errors);

  useEffect(() => {
    setFieldValue(
      'existProductBatchIds',
      selectedProductBathes.map(({ id }) => id),
    );
  }, [selectedProductBathes]);

  const { statusList } = useStatusList();

  const changeStatus = useCallback(
    (status: StatusDto | null) => {
      setFieldValue('statusId', status?.id);
    },
    [setFieldValue],
  );

  const statusValue = useMemo(
    () => statusList.find(item => item.id == values.statusId),
    [statusList, values],
  );

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <InputText
        value={values.name}
        name="name"
        onChange={handleChange}
        onBlur={handleBlur}
        className="p-inputtext-sm"
        placeholder="Название группы"
      />

      <StatusSelect value={statusValue ?? null} onChange={changeStatus} />
      <br />
      <Button type="submit">Добавить</Button>
    </form>
  );
};

export const CreateProductBatchGroupForm = withFormik<Props, FormValues>({
  validationSchema: () => createProductBatchGroupValidationSchema(),
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
        const dto = values as CreateProductBatchGroupDto;
        apolloClient
          .mutate({
            mutation: CREATE_PRODUCT_BATCH_GROUP_MUTATION,
            variables: {
              dto,
            },
          })
          .then(result => {
            if (result.errors?.length) {
              alert('ERROR');
            } else {
              formikBag.props.closeModal();
              formikBag.props.onSubmit(dto, formikBag);
            }
          })
          .catch(err => {
            console.log(err);
            alert('ERROR');
          });
      },
    });
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

export const CreateProductBatchGroupModal = NiceModal.create(
  withModal(CreateProductBatchGroupForm, {
    header: 'Добавить партию',
  }),
);
