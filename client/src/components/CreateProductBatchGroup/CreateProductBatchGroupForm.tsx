import NiceModal from '@ebay/nice-modal-react';
import { Button, TextInput } from '@mantine/core';
import { FormikErrors, withFormik } from 'formik';
import { FormikBag } from 'formik/dist/withFormik';
import React, { type FC, useCallback, useEffect, useMemo } from 'react';

import { CREATE_PRODUCT_BATCH_MUTATION } from '../../api/product-batch/product-batch.gql';
import { CREATE_PRODUCT_BATCH_GROUP_MUTATION } from '../../api/product-batch-group/product-batch-group.gql';
import { useStatusList } from '../../api/status/status.hooks';
import apolloClient from '../../apollo-client';
import {
  CreateProductBatchDto,
  CreateProductBatchGroupDto,
  type StatusDto,
  StatusFragment,
} from '../../gql-types/graphql';
import { useAppSelector } from '../../hooks';
import { fromRouble } from '../../utils';
import AutocompleteObject from '../AutocompleteObject/AutocompleteObject';
import { selectSelectedIds } from '../ProductBatchPage/product-batch-page.slice';
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
  const { handleSubmit, handleBlur, handleChange, setFieldValue, values } =
    props;

  const selectedIds = useAppSelector(selectSelectedIds);

  useEffect(() => {
    setFieldValue('existProductBatchIds', selectedIds);
  }, [selectedIds]);

  const { statusList } = useStatusList();

  const autocompleteValue = useCallback(
    (item: StatusFragment) => item.title,
    [],
  );

  const changeStatus = useCallback(
    (status: StatusDto | undefined) => {
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
      <TextInput
        label="Название группы"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <AutocompleteObject
        label="Колонка"
        objDataList={statusList}
        valueObj={statusValue}
        onChangeObj={changeStatus}
        getValue={autocompleteValue}
      />
      <br />
      <Button
        type="submit"
        // disabled={!newBathes.length}
      >
        Добавить
      </Button>
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
    const dto = values as CreateProductBatchGroupDto;
    apolloClient
      .mutate({
        mutation: CREATE_PRODUCT_BATCH_GROUP_MUTATION,
        variables: {
          dto,
        },
      })
      .then(result => {
        console.log(result);
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
