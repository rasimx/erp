import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import {
  CreateProductBatchDto,
  MoveProductBatchDto,
} from '../../gql-types/graphql';
import {
  CREATE_PRODUCT_BATCH_MUTATION,
  DELETE_PRODUCT_BATCH_MUTATION,
  MOVE_PRODUCT_BATCH_MUTATION,
} from './product-batch.gql';

export const useProductBatchMutations = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [create] = useMutation(CREATE_PRODUCT_BATCH_MUTATION);
  const createProductBatch = useCallback((dto: CreateProductBatchDto) => {
    return create({ variables: { dto } })
      .then(res => {
        if (res.errors?.length) throw new Error('AAA');
      })
      .catch(err => {
        // todo: обработать ошику
        enqueueSnackbar(err.message, {
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        });
        // setKanbanCards([...kanbanCards]);
      });
    // .finally(() => {
    //   setLoadingId(null);
    // });
  }, []);
  const [moveBatch] = useMutation(MOVE_PRODUCT_BATCH_MUTATION);
  const moveProductBatch = useCallback(
    (dto: MoveProductBatchDto) =>
      moveBatch({ variables: { dto } })
        .then(res => res)
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar(err.message, {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          // setKanbanCards([...kanbanCards]);
        }),
    [],
  );

  const [deleteBatch] = useMutation(DELETE_PRODUCT_BATCH_MUTATION);
  const deleteProductBatch = useCallback(
    (id: number) =>
      deleteBatch({ variables: { id } })
        .then(res => res)
        .catch(err => {
          // todo: обработать ошику
          enqueueSnackbar(err.message, {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          // setKanbanCards([...kanbanCards]);
        }),
    [],
  );

  return {
    moveProductBatch,
    createProductBatch,
    deleteProductBatch,
  };
};
