import { Autocomplete } from '@mantine/core';
import { CloseButton } from '@mantine/core';
import { AutocompleteProps } from '@mantine/core/lib/components/Autocomplete/Autocomplete';
import omit from 'lodash/omit';
import React, { useCallback, useMemo } from 'react';

export interface Props<T> extends AutocompleteProps {
  objDataList: T[];
  getValue: (item: T) => string;
  valueObj: T | undefined;
  onChangeObj: (value: T | undefined) => void;
}

function AutocompleteObject<T>(props: Props<T>) {
  const { objDataList, getValue, valueObj, onChangeObj } = props;

  const dataMap = useMemo(
    () => new Map(objDataList.map(item => [getValue(item), item])),
    [objDataList],
  );

  const changeHandle = useCallback(
    (strValue: string) => {
      const value = dataMap.get(strValue);
      onChangeObj(value);
    },
    [onChangeObj, dataMap],
  );

  const clearIcon = useMemo(() => {
    return <CloseButton onClick={() => onChangeObj(undefined)} />;
  }, []);

  return (
    <Autocomplete
      {...omit(props, ['objDataList', 'valueObj', 'onChangeObj', 'getValue'])}
      data={[...dataMap.keys()]}
      value={valueObj ? getValue(valueObj) : ''}
      onChange={changeHandle}
      rightSection={clearIcon}
    />
  );
}
export default AutocompleteObject;
