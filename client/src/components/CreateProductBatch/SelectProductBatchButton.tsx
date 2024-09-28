import { useModal } from '@ebay/nice-modal-react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import { ProductBatchFragment } from '../../gql-types/graphql';
import { SelectProductBatchModal } from '../SelectProductBatch/SelectProductBatch';

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
    <div>
      <Button onClick={showProductBatchModal}>
        {selected?.id ?? `Выбрать партию`}
      </Button>
      {selected && (
        <Button onClick={clear}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      )}
    </div>
  );
};

export default SelectProductBatchButton;
