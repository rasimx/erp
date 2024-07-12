import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import {
  CreateProductBatchDto,
  MoveProductBatchDto,
  ProductBatchFragment,
  ProductBatchGroupFragment,
} from '../../gql-types/graphql';
import {
  CREATE_PRODUCT_BATCH_MUTATION,
  MOVE_PRODUCT_BATCH_MUTATION,
} from './product-batch.gql';

export type KanbanCard = ProductBatchFragment | ProductBatchGroupFragment;

export const useProductBatch = () => {
  const [create] = useMutation(CREATE_PRODUCT_BATCH_MUTATION);
  const createProductBatch = useCallback(
    (variables: {
      dto: CreateProductBatchDto;
      statusId: number | null;
      groupId: number | null;
    }) => {
      return create({ variables })
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
    },
    [],
  );
  const [moveBatch] = useMutation(MOVE_PRODUCT_BATCH_MUTATION);

  const { enqueueSnackbar } = useSnackbar();

  const moveProductBatch = useCallback((dto: MoveProductBatchDto) => {
    moveBatch({ variables: { dto } })
      .then(res => {})
      .catch(err => {
        // todo: обработать ошику
        enqueueSnackbar(err.message, {
          variant: 'error',
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        });
        // setKanbanCards([...kanbanCards]);
      });
  }, []);

  return { moveProductBatch, createProductBatch };
};
