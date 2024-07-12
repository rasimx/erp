import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import {
  CreateProductBatchGroupDto,
  MoveProductBatchGroupDto,
} from '../../gql-types/graphql';
import {
  CREATE_PRODUCT_BATCH_GROUP_MUTATION,
  MOVE_PRODUCT_BATCH_GROUP_MUTATION,
} from '../product-batch-group/product-batch-group.gql';

export const useProductBatchGroup = () => {
  const [createGroup] = useMutation(CREATE_PRODUCT_BATCH_GROUP_MUTATION);
  const createProductBatchGroup = useCallback(
    (dto: CreateProductBatchGroupDto) => {
      return createGroup({ variables: { dto } })
        .then(res => {
          // refetch();
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

  const { enqueueSnackbar } = useSnackbar();

  const [moveGroup] = useMutation(MOVE_PRODUCT_BATCH_GROUP_MUTATION);
  const moveProductBatchGroup = useCallback((dto: MoveProductBatchGroupDto) => {
    return moveGroup({ variables: { dto } })
      .then(res => {
        // refetch();
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

  return { createProductBatchGroup, moveProductBatchGroup };
};