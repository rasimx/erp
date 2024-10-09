import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { CreateOperationDto } from '@/gql-types/graphql';

import { ADD_OPERATION_MUTATION } from './operation.gql';

export const useOperation = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [create] = useMutation(ADD_OPERATION_MUTATION);
  const createOperation = useCallback((dto: CreateOperationDto) => {
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
  return { createOperation };
};
