import { useModal } from '@ebay/nice-modal-react';
import { FormikProps } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { FC, useState } from 'react';

import { CreateProductBatchModal } from '../CreateProductBatch/CreateProductBatchForm';
import { SelectExistsProductBatchModal } from './SelectExistsProductBatchForm';
import { FormValues, Props } from './types';

const Form: FC<Props & FormikProps<FormValues>> = props => {
  const createProductBatchModal = useModal(CreateProductBatchModal);
  const selectProductBatchModal = useModal(SelectExistsProductBatchModal);

  console.log(props.errors);
  return (
    <form
      onSubmit={props.handleSubmit}
      noValidate
      autoComplete="off"
      className="flex flex-column"
    >
      <h5>Добавить группу в колонку {props.groupStatus.title}</h5>
      <InputText
        name="name"
        placeholder="Название группы"
        value={props.values.name}
        onBlur={props.handleBlur}
        onChange={props.handleChange}
      />
      <Button
        size="small"
        icon="pi pi-file-plus"
        className="mt-2"
        label="Добавить новую партию"
        onClick={() =>
          createProductBatchModal.show({
            // initialValues: {},
            onSubmit: async values => {
              void props.setFieldValue('newProductBatches', [
                ...(props.values.newProductBatches || []),
                values,
              ]);
            },
          })
        }
      />
      {!!props.values.newProductBatches?.length && (
        <table
          style={{ minWidth: 650 }}
          aria-label="simple table"
          className="mt-2"
        >
          <tr>
            <th>Существующие</th>
            <th align="right">цена покупки</th>
            <th align="right">кол-во</th>
            <th align="right"></th>
          </tr>

          <tbody>
            {props.values.newProductBatches?.map((row, index) => (
              <tr
                key={row.name}
                // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <td scope="row">{row.product.sku}</td>
                <td align="right">{row.costPricePerUnit}</td>
                <td align="right">{row.count}</td>
                <td align="right">
                  <Button
                    icon="pi pi-trach"
                    size="small"
                    onClick={() => {
                      const newProductBatches = [
                        ...props.values.newProductBatches,
                      ];
                      newProductBatches.splice(index, 1);
                      void props.setFieldValue(
                        'newProductBatches',
                        newProductBatches,
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button
        size="small"
        icon="pi pi-file"
        className="mt-2"
        label="Добавить товары из существующих партий"
        onClick={() =>
          selectProductBatchModal.show({
            onSubmit: values =>
              props.setFieldValue('existProductBatches', [
                ...(props.values.existProductBatches || []),
                values,
              ]),
          })
        }
      />
      <Button
        size="small"
        icon="pi pi-file"
        className="mt-2"
        label="перенести существующую партию"
        onClick={() =>
          selectProductBatchModal.show({
            onSubmit: values =>
              props.setFieldValue('existProductBatches', [
                ...(props.values.existProductBatches || []),
                values,
              ]),
          })
        }
      />
      <Button
        size="small"
        icon="pi pi-file"
        className="mt-2"
        label="собрать комбо товары"
        onClick={() =>
          selectProductBatchModal.show({
            onSubmit: values =>
              props.setFieldValue('existProductBatches', [
                ...(props.values.existProductBatches || []),
                values,
              ]),
          })
        }
      />
      {!!props.values.existProductBatches?.length && (
        <table aria-label="simple table" className="mt-2">
          <tr>
            <th>Существующие</th>
            <th align="right">цена покупки</th>
            <th align="right">кол-во</th>
            <th align="right"></th>
          </tr>

          <tbody>
            {props.values.existProductBatches?.map((row, index) => (
              <tr
                key={row.product.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <td scope="row">{row.product.sku}</td>
                <td align="right">{row.productBatch.costPricePerUnit}</td>
                <td align="right">{row.productBatch.count}</td>
                <td align="right">
                  <Button
                    size="small"
                    icon="pi pi-edit"
                    onClick={() =>
                      selectProductBatchModal.show({
                        initialValues: row,
                        onSubmit: values => {
                          const existProductBatches = [
                            ...props.values.existProductBatches,
                          ];
                          existProductBatches.splice(index, 1, values);
                          void props.setFieldValue(
                            'existProductBatches',
                            existProductBatches,
                          );
                        },
                      })
                    }
                  />
                  <Button
                    size="small"
                    icon="pi pi-trash"
                    onClick={() => {
                      const existProductBatches = [
                        ...props.values.existProductBatches,
                      ];
                      existProductBatches.splice(index, 1);
                      void props.setFieldValue(
                        'existProductBatches',
                        existProductBatches,
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button
        size="small"
        type="submit"
        className="mt-2"
        label="Создать группу"
      />
    </form>
  );
};

export default Form;
