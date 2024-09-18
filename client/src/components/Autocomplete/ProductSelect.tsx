import { useLazyQuery } from '@apollo/client';
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from 'primereact/autocomplete';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getProductFragment,
  Product,
  PRODUCT_LIST_QUERY,
  PRODUCT_SET_LIST_QUERY,
} from '../../api/product/product.gql';

export interface Props {
  value: Product | null;
  onChange: (value: Product | null) => void;
  initialId?: number | null;
  onlySets?: boolean;
}

const ProductSelect: FC<Props> = props => {
  const { value, onChange, initialId, onlySets } = props;

  const [loadProductSetList, { data: setData, loading: setLoading }] =
    useLazyQuery(PRODUCT_SET_LIST_QUERY, {
      fetchPolicy: 'network-only',
    });
  const [loadProductList, { data, loading }] = useLazyQuery(
    PRODUCT_LIST_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    if (onlySets) {
      loadProductSetList();
    } else {
      loadProductList();
    }
  }, []);

  const items = useMemo(
    () =>
      getProductFragment(
        onlySets ? setData?.productSetList.items : data?.productList.items,
      ) ?? [],
    [setData, data],
  );

  useEffect(() => {
    if (initialId && value?.id != initialId && items.length) {
      const product = items.find(item => item.id === initialId);
      if (product) onChange(product);
    }
  }, [initialId, onChange]);

  // const clearIcon = useMemo(() => {
  //   return <CloseButton onClick={() => onChangeObj(undefined)} />;
  // }, []);

  const [filteredOptions, setFilteredOptions] = useState<Product[]>([]);

  const search = useCallback(
    (event: AutoCompleteCompleteEvent) => {
      // Timeout to emulate a network connection
      // setTimeout(() => {
      let _filteredOptions;

      if (!event.query.trim().length) {
        _filteredOptions = [...items];
      } else {
        _filteredOptions = items.filter(option => {
          return (
            option.sku.toLowerCase().includes(event.query.toLowerCase()) ||
            option.name.toLowerCase().includes(event.query.toLowerCase())
          );
        });
      }
      setFilteredOptions(_filteredOptions);
      // }, 250);
    },
    [items],
  );

  const changeHandle = useCallback(
    (event: AutoCompleteChangeEvent) => {
      onChange(event.value);
    },
    [onChange],
  );
  const selectedItemTemplate = useCallback((value: Product) => {
    return `${value.sku}: ${value.name}`;
  }, []);

  const itemTemplate = useCallback((suggestion: Product, index: number) => {
    return (
      <div style={{ width: '300px', textWrap: 'wrap' }}>
        <strong>{suggestion.sku}</strong>: {suggestion.name}
      </div>
    );
  }, []);

  return (
    <AutoComplete
      style={{ width: '100%' }}
      inputStyle={{ width: '100%' }}
      field="name"
      selectedItemTemplate={selectedItemTemplate}
      itemTemplate={itemTemplate}
      value={value}
      suggestions={filteredOptions}
      completeMethod={search}
      onChange={changeHandle}
      dropdown
    />
  );
};
export default ProductSelect;
