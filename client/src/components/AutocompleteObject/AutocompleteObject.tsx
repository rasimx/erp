import { Autocomplete } from '@mantine/core';
import { CloseButton } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

export interface Props<T> {
  data: T[];
  getValue: (item: T) => string;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

function AutocompleteObject<T>(props: Props<T>) {
  const { data, getValue, value, onChange } = props;

  const dataMap = useMemo(
    () => new Map(data.map(item => [getValue(item), item])),
    [data],
  );

  const changeHandle = useCallback(
    (strValue: string) => {
      const value = dataMap.get(strValue);
      onChange(value);
    },
    [onChange, dataMap],
  );

  const clearIcon = useMemo(() => {
    return <CloseButton onClick={() => onChange(undefined)} />;
  }, []);

  return (
    <Autocomplete
      label="Товар"
      placeholder="Выберите товар"
      data={[...dataMap.keys()]}
      value={value ? getValue(value) : ''}
      onChange={changeHandle}
      rightSection={clearIcon}
    />
  );
}
export default AutocompleteObject;
