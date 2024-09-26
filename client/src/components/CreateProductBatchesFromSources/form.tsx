import { useModal } from '@ebay/nice-modal-react';
import cx from 'clsx';
import {
  Accordion,
  AccordionTab,
  AccordionTabChangeEvent,
} from 'primereact/accordion';
import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { FloatLabel } from 'primereact/floatlabel';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Nullable } from 'primereact/ts-helpers';
import React, { FC, SyntheticEvent, useCallback, useState } from 'react';

import { Product } from '../../api/product/product.gql';
import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import ProductSelect from '../Autocomplete/ProductSelect';
import { SelectProductBatchModal } from '../CreateProductBatch/SelectProductBatch';
import classes from './form.module.scss';
import { FormProps, Props } from './types';

const CreateProductBatchesFromSourcesForm: FC<Props & FormProps> = props => {
  const {
    handleSubmit,
    setValues,
    submitForm,
    values,
    errors,
    setFieldValue,
    handleChange,
    handleBlur,
    touched,
  } = props;
  console.log('values', values);
  console.log('errors', errors);

  const [activeTab, setActiveTab] = useState<number | null>(null);

  const [productMap, setProductMap] = useState<Map<number, Product>>(new Map());

  const addProduct = useCallback(
    (product: Nullable<Product>) => {
      if (product) {
        setProductMap(map => {
          map.set(product.id, product);
          return new Map(map);
        });
      }
    },
    [setProductMap],
  );
  const removeProduct = useCallback(
    (productId: number, index: number) => (e: SyntheticEvent) => {
      e.stopPropagation();
      if (activeTab == index) setActiveTab(null);
      setProductMap(map => {
        map.delete(productId);
        return new Map(map);
      });
      void setValues({
        ...values,
        sources: [
          ...(values.sources || []).filter(
            item => item.productId !== productId,
          ),
        ],
      });
    },
    [setProductMap, activeTab],
  );

  const productBatchModal = useModal(SelectProductBatchModal);

  const addProductBatchHandle = useCallback(
    (productId: number, index: number) => (e: SyntheticEvent) => {
      e.stopPropagation();
      productBatchModal.show({
        productId: productId,
        excludedIds: values.sources?.map(({ id }) => id),
        onSelect: (batch: ProductBatch) => {
          if (!values.sources?.some(item => item.id === batch.id)) {
            setActiveTab(index);
            void setValues({
              ...values,
              sources: [
                // @ts-expect-error .....
                ...(values.sources || []),
                // @ts-expect-error .....
                { selectedCount: null, productId, id: batch.id },
              ],
            });
          }
        },
      });
    },
    [setValues, values, productBatchModal],
  );

  const updateSelectedCount = useCallback(
    (productBatchId: number) => (event: InputNumberValueChangeEvent) => {
      if (event.value) {
        void setValues({
          ...values,
          // @ts-expect-error .....
          sources: values.sources.map(item => ({
            ...item,
            selectedCount:
              item.id == productBatchId ? event.value : item.selectedCount,
          })),
        });
      }
    },
    [setValues, values],
  );
  const removeProductBatch = useCallback(
    (productBatchId: number) => (e: SyntheticEvent) => {
      e.stopPropagation();
      void setValues({
        ...values,
        sources: values.sources.filter(item => item.id != productBatchId),
      });
    },
    [setValues, values],
  );

  const groupCheckboxHandler = useCallback(
    (e: CheckboxChangeEvent) => {
      void setFieldValue('grouped', !!e.checked);
      if (!e.checked) setFieldValue('groupName', null);
    },
    [setFieldValue],
  );

  const onSubmitHandler = useCallback(() => {
    const sourcesProductIds = [
      ...new Set([...(values.sources || []).map(item => item.productId)]),
    ];
    if ([...productMap.keys()].every(id => sourcesProductIds.includes(id))) {
      void submitForm();
    }
  }, [submitForm, values]);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      className={classes.form}
    >
      <Accordion
        activeIndex={activeTab}
        onTabChange={(e: AccordionTabChangeEvent) => {
          setActiveTab(e.index as number);
        }}
      >
        {[...productMap.values()].map((product, index) => {
          return (
            <AccordionTab
              key={product.id}
              // headerClassName={cx(
              //   !values.sources?.filter(item => item.productId == product.id)
              //     .length && classes.error,
              // )}
              headerClassName={classes.accordionHeader}
              disabled={
                !values.sources?.filter(item => item.productId == product.id)
                  .length
              }
              header={
                <div className={classes.accordionHeaderInner}>
                  <div>{product.sku}</div>
                  <div>
                    {values.sources?.reduce(
                      (prev, cur) =>
                        prev +
                        (cur.productId == product.id
                          ? cur.selectedCount ?? 0
                          : 0),
                      0,
                    )}{' '}
                    шт
                  </div>
                  <ButtonGroup>
                    <Button
                      label="Добавить партию"
                      icon="pi pi-check"
                      type="button"
                      onClick={addProductBatchHandle(product.id, index)}
                    />
                    <Button
                      icon="pi pi-trash"
                      onClick={removeProduct(product.id, index)}
                      type="button"
                    />
                  </ButtonGroup>
                </div>
              }
            >
              {values.sources
                ?.filter(item => item.productId == product.id)
                .map(item => (
                  <div>
                    {item.id}:{' '}
                    <InputNumber
                      required
                      placeholder=" шт"
                      suffix=" шт"
                      maxFractionDigits={0}
                      value={item.selectedCount}
                      onValueChange={updateSelectedCount(item.id)}
                    />
                    <Button
                      icon="pi pi-trash"
                      onClick={removeProductBatch(item.id)}
                      type="button"
                    />
                  </div>
                ))}
            </AccordionTab>
          );
        })}
      </Accordion>
      <div className={classes.field}>
        <FloatLabel>
          <ProductSelect value={null} onChange={addProduct} />
          <label>Продукт</label>
        </FloatLabel>
      </div>

      <div className={classes.bottom}>
        <div>
          <Checkbox
            inputId="group"
            name="grouped"
            onBlur={handleBlur}
            onChange={groupCheckboxHandler}
            checked={values.grouped}
          />
          <label htmlFor="group" className="ml-2">
            Объединить в группу
          </label>
        </div>
        {values.grouped && (
          <div>
            <InputText
              value={values.groupName}
              name="groupName"
              onChange={handleChange}
              onBlur={handleBlur}
              className="p-inputtext-sm"
              placeholder="Название группы"
              invalid={touched.groupName && !!errors.groupName}
            />
          </div>
        )}
        <Button type="button" onClick={onSubmitHandler}>
          Отправить
        </Button>
      </div>
    </form>
  );
};

export default CreateProductBatchesFromSourcesForm;
