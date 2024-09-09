import { useModal } from '@ebay/nice-modal-react';
import ClearIcon from '@mui/icons-material/Clear';
import { Button, ButtonGroup } from '@mui/material';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { ProductBatchFragment } from '../../gql-types/graphql';
import { SelectProductBatchModal } from './SelectProductBatch';

export interface Props {
  onChange: (data: ProductBatchFragment | undefined) => void;
  valueId?: number | null;
  productId: number;
}

const SelectProductBatchButton: FC<Props> = ({
  onChange,
  productId,
  valueId,
}) => {
  const [selected, setSelected] = useState<ProductBatchFragment | undefined>();

  useEffect(() => {
    if (selected) {
      onChange(selected);
    }
  }, [selected]);

  const clear = useCallback(() => {
    setSelected(undefined);
    onChange(undefined);
  }, [onChange]);

  const productBatchModal = useModal(SelectProductBatchModal);
  const showProductBatchModal = useCallback(() => {
    productBatchModal.show({
      productId,
      initialId: valueId,
      onSelect: (data: ProductBatchFragment) => {
        setSelected(data);
        onChange(data);
      },
    });
  }, [onChange, setSelected]);

  return (
    <>
      <ButtonGroup
        variant="contained"
        aria-label="Button group with a nested menu"
      >
        <Button onClick={showProductBatchModal}>
          {selected?.id ?? `Выбрать партию`}
        </Button>
        {selected && (
          <Button size="small" onClick={clear}>
            <ClearIcon />
          </Button>
        )}
      </ButtonGroup>
    </>
  );
};

export default SelectProductBatchButton;
