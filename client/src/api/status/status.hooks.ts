import { useMutation, useQuery } from '@apollo/client';
import { arrayMove } from '@dnd-kit/sortable';
import { enableMapSet } from 'immer';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';

enableMapSet();

import { type StatusDto, StatusFragment } from '@/gql-types/graphql';

import { getFragmentData } from '../../gql-types';
import {
  GET_STATUS_QUERY,
  MOVE_STATUS_MUTATION,
  STATUS_FRAGMENT,
  STATUS_LIST_QUERY,
} from './status.gql';

export const useStatus = (id: number) => {
  const { data } = useQuery(GET_STATUS_QUERY, { variables: { id } });
  return getFragmentData(STATUS_FRAGMENT, data?.status);
};

export const useStatusList = (ids: number[] = []) => {
  const [statusMap, setStatusMap] = useImmer<Map<number, StatusFragment>>(
    new Map(),
  );
  const [statusList, setStatusList] = useImmer<StatusDto[]>([]);

  useEffect(() => {
    setStatusList(
      [...statusMap.values()].toSorted((a, b) => a.order - b.order),
    );
  }, [statusMap]);

  const {
    data: statusListData,
    error,
    loading,
  } = useQuery(STATUS_LIST_QUERY, {
    fetchPolicy: 'network-only',
    skip: statusList.length > 0,
    variables: { ids },
  });
  useEffect(() => {
    if (statusListData) {
      setStatusList(
        getFragmentData(STATUS_FRAGMENT, statusListData?.statusList).toSorted(
          (a, b) => a.order - b.order,
        ),
      );
    }
  }, [statusListData]);

  const [move] = useMutation(MOVE_STATUS_MUTATION);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const moveStatus = useCallback(
    (active: StatusDto, over: StatusDto) => {
      setLoadingId(active.id);
      const activeIndex = statusList.indexOf(active);
      const overIndex = statusList.indexOf(over);
      setStatusList(statusList =>
        arrayMove(statusList, activeIndex, overIndex),
      );

      move({ variables: { dto: { id: active.id, order: over.order } } })
        .then(({ data, errors }) => {
          if (data) {
            const newItemsMap = new Map(
              getFragmentData(STATUS_FRAGMENT, data?.moveStatus).map(item => [
                item.id,
                item,
              ]),
            );
            setStatusList(draft => {
              draft.forEach(draftItem => {
                const item = newItemsMap.get(draftItem.id);
                if (item && draftItem.order != item.order) {
                  draftItem.order = item.order;
                }
              });
            });
          } else {
            setStatusList(
              [...statusMap.values()].toSorted((a, b) => a.order - b.order),
            );
          }
        })
        .catch(e => {
          // todo: обработать ошику
          enqueueSnackbar('This is a error message!', {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          });
          setStatusList(
            [...statusMap.values()].toSorted((a, b) => a.order - b.order),
          );
        })
        .finally(() => {
          setLoadingId(null);
        });
    },
    [statusList],
  );

  return {
    statusList,
    moveStatus,
    error,
    loading,
    loadingId,
  };
};
