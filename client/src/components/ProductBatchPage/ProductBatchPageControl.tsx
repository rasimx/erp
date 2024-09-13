import { useModal } from '@ebay/nice-modal-react';
import { Button } from '@mantine/core';
import { FC, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { CreateProductBatchGroupModal } from '../CreateProductBatchGroup/CreateProductBatchGroupForm';
import {
  selectIsSelectingMode,
  toggleSelecting,
} from './product-batch-page.slice';

export const ProductBatchPageControl: FC = () => {
  const dispatch = useAppDispatch();
  const isSelecting = useAppSelector(selectIsSelectingMode);

  const selectingHandle = useCallback(() => dispatch(toggleSelecting()), []);

  const createProductBatchGroupModal = useModal(CreateProductBatchGroupModal);
  const showCreateProductBatchGroupModal = useCallback(() => {
    createProductBatchGroupModal.show({
      initialValues: {},
      onSubmit: async values => {
        // createProductBatch({
        //   ...omit(values, ['product']),
        //   productId: values.product.id,
        //   statusId: status.id,
        //   groupId: null,
        // })
        //   .then(result => {
        //     refetch();
        //   })
        //   .catch(err => {
        //     alert('ERROR');
        //   });
      },
    });
  }, []);

  return (
    <div>
      <Button onClick={selectingHandle}>
        {isSelecting ? 'Отмена' : 'Выбрать партии'}
      </Button>
      <Button onClick={showCreateProductBatchGroupModal}>
        Объединить в группу
      </Button>
    </div>
  );
};