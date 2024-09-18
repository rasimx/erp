import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from 'primereact/autocomplete';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { Product } from '../../api/product/product.gql';
import { useStatusList } from '../../api/status/status.hooks';
import { StatusFragment } from '../../gql-types/graphql';

export interface Props {
  value: StatusFragment | null;
  onChange: (value: StatusFragment | null) => void;
  initialId?: number | null;
}

const StatusSelect: FC<Props> = props => {
  const { value, onChange, initialId } = props;

  const { statusList } = useStatusList();

  useEffect(() => {
    if (initialId && value?.id != initialId && statusList.length) {
      const product = statusList.find(item => item.id === initialId);
      if (product) onChange(product);
    }
  }, [initialId, onChange]);

  const changeHandle = useCallback(
    (event: AutoCompleteChangeEvent) => {
      onChange(event.value);
    },
    [onChange],
  );
  const selectedItemTemplate = useCallback((value: any) => {
    return value.title;
  }, []);

  const [filteredOptions, setFilteredOptions] = useState<StatusFragment[]>([]);

  const search = useCallback(
    (event: AutoCompleteCompleteEvent) => {
      // Timeout to emulate a network connection
      // setTimeout(() => {
      let _filteredOptions;

      if (!event.query.trim().length) {
        _filteredOptions = [...statusList];
      } else {
        _filteredOptions = statusList.filter(option => {
          return option.title.toLowerCase().includes(event.query.toLowerCase());
        });
      }
      setFilteredOptions(_filteredOptions);
      // }, 250);
    },
    [statusList],
  );

  return (
    <AutoComplete
      field="title"
      selectedItemTemplate={selectedItemTemplate}
      value={value}
      suggestions={filteredOptions}
      completeMethod={search}
      onChange={changeHandle}
      dropdown
    />
  );
};
export default StatusSelect;
