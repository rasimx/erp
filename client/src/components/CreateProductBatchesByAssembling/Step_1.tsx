import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { StepperRefAttributes } from 'primereact/stepper';
import React, {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Product } from '../../api/product/product.gql';
import { useProductSetList } from '../../api/product/product.hooks';
import { useFormState } from './types';

export type Props = {
  stepperRef: MutableRefObject<StepperRefAttributes | null>;
};

const Step_1: FC<Props> = props => {
  const { stepperRef } = props;

  const { state, setState } = useFormState();

  const { items: productList } = useProductSetList();

  const [autocompleteInput, setAutocompleteInput] = useState('');

  useEffect(() => {
    if (productList.length && state.productSetId) {
      const productSet = productList.find(
        item => item.id === state.productSetId,
      );
      if (productSet && productSet.id != state.productSet?.id)
        setState(state => ({ ...state, productSet }));
    }
    if (!state.productSetId && !!state.productSet)
      setState(state => ({ ...state, productSet: null }));
  }, [productList, state]);

  const changeProduct = useCallback(
    (e: AutoCompleteSelectEvent) => {
      if (e.value.id) {
        setState(state => ({ ...state, productSetId: e.value.id }));
      } else setState(state => ({ ...state, productSetId: null }));
    },
    [setState],
  );

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([
    ...productList,
  ]);

  const search = useCallback(
    (event: AutoCompleteCompleteEvent) => {
      let _filteredProducts;
      if (!event.query.trim().length) {
        _filteredProducts = [...productList];
      } else {
        _filteredProducts = productList.filter(product => {
          return (
            product.name.toLowerCase().includes(event.query.toLowerCase()) ||
            product.sku.toLowerCase().includes(event.query.toLowerCase())
          );
        });
      }
      setFilteredProducts(
        _filteredProducts.map(item => ({
          ...item,
          name: `${item.sku}: ${item.name}`,
        })),
      );
    },
    [productList],
  );

  return (
    <>
      <Divider />
      <div className="flex flex-column">
        <div className="p-float-label mt-5 flex max-w-full">
          <AutoComplete
            id="ac"
            field="name"
            onClear={e => {
              setState(state => ({ ...state, productSetId: null }));
            }}
            removeTokenIcon="pi pi-times"
            value={state.productSet ?? autocompleteInput}
            completeMethod={search}
            suggestions={filteredProducts}
            onChange={e => setAutocompleteInput(e.value)}
            onSelect={changeProduct}
            className="w-full block"
            inputClassName="w-full"
          />

          <label htmlFor="ac">Выбрать товар</label>
        </div>
        <div className="p-float-label mt-5">
          <InputNumber
            id="fullCount"
            value={state.fullCount}
            min={0}
            onChange={e =>
              setState(state => ({ ...state, fullCount: e.value }))
            }
          />
          <label>Количество</label>
        </div>
      </div>
      <div className="flex pt-4 justify-content-end">
        <Button
          label="Next"
          icon="pi pi-arrow-right"
          iconPos="right"
          disabled={!state.productSet || !state.fullCount}
          onClick={() => stepperRef.current?.nextCallback()}
        />
      </div>
    </>
  );
};

export default Step_1;
