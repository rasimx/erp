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
import { SelectProductBatchModal } from '../SelectProductBatch/SelectProductBatch';
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

  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = useCallback(
    (product: Nullable<Product>) => {
      if (product) {
        const index = products.findIndex(item => item.id === product.id);
        if (index == -1) setProducts(products.concat([product]));
      }
    },
    [products, setProducts],
  );
  const removeProduct = useCallback(
    (productId: number, index: number) => (e: SyntheticEvent) => {
      e.stopPropagation();

      if (activeTab == index) setActiveTab(null);
      setProducts(products => {
        products.splice(index, 1);
        return products;
      });

      void setValues(values => ({
        ...values,
        items: [
          ...(values.items || []).filter(item => item.productId !== productId),
        ],
      }));
    },
    [setProducts, activeTab],
  );

  const productBatchModal = useModal(SelectProductBatchModal);

  const addProductBatchHandle = useCallback(
    (productId: number, index: number) => (e: SyntheticEvent) => {
      e.stopPropagation();
      productBatchModal.show({
        productId: productId,
        excludedIds: values.items
          ?.filter(item => item.productId == productId)
          .flatMap(item => item.sourceIds),
        onSelect: (batch: ProductBatch) => {
          if (
            !values.items?.some(
              item =>
                item.productId == batch.productId &&
                item.sourceIds.includes(batch.id),
            )
          ) {
            setActiveTab(index);
            void setValues(values => {
              values.items = [
                ...(values.items || []),
                {
                  productId,
                  count: 0,
                  sourceIds: [batch.id],
                },
              ];

              return values;
            });
          }
        },
      });
    },
    [setValues, values, productBatchModal],
  );

  const updateSelectedCount = useCallback(
    (productId: number, productBatchId: number) =>
      (event: InputNumberValueChangeEvent) => {
        if (event.value) {
          void setValues({
            ...values,
            // @ts-expect-error .....
            items: values.items.map(item => ({
              ...item,
              count:
                item.productId == productId &&
                item.sourceIds.includes(productBatchId)
                  ? event.value
                  : item.count,
            })),
          });
        }
      },
    [setValues, values],
  );
  const removeProductBatch = useCallback(
    (productId: number, productBatchId: number) => (e: SyntheticEvent) => {
      e.stopPropagation();
      void setValues({
        ...values,
        items: values.items.filter(
          item =>
            item.productId != productId ||
            !item.sourceIds.includes(productBatchId),
        ),
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
    const sourcesProductIds = values.items.map(item => item.productId);
    if (
      products.map(({ id }) => id).every(id => sourcesProductIds.includes(id))
    ) {
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
        {products.map((product, index) => {
          return (
            <AccordionTab
              key={product.id}
              // headerClassName={cx(
              //   !values.sources?.filter(item => item.productId == product.id)
              //     .length && classes.error,
              // )}
              headerClassName={classes.accordionHeader}
              // disabled={
              //   !values.items?.filter(item => item.productId == product.id)
              //     .length
              // }
              header={
                <div className={classes.accordionHeaderInner}>
                  <div>{product.sku}</div>
                  <div>
                    {values.items?.reduce(
                      (prev, cur) =>
                        prev +
                        (cur.productId == product.id ? cur.count ?? 0 : 0),
                      0,
                    )}{' '}
                    шт
                  </div>
                  <ButtonGroup>
                    <Button
                      label="Добавить партию"
                      // icon="pi pi-check"
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
              {values.items
                ?.filter(item => item.productId == product.id)
                .map(item =>
                  item.sourceIds.map(sourceId => (
                    <div>
                      {sourceId}:{' '}
                      <InputNumber
                        required
                        placeholder=" шт"
                        suffix=" шт"
                        maxFractionDigits={0}
                        value={item.count}
                        onValueChange={updateSelectedCount(
                          product.id,
                          sourceId,
                        )}
                      />
                      <Button
                        icon="pi pi-trash"
                        onClick={removeProductBatch(product.id, sourceId)}
                        type="button"
                      />
                    </div>
                  )),
                )}
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
