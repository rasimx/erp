import { useMutation, useQuery } from '@apollo/client';
import { arrayMove } from '@dnd-kit/sortable';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import { type StatusDto, StatusFragment } from '@/gql-types/graphql';

import { getFragmentData } from '../../gql-types';
import {
  MOVE_STATUS_MUTATION,
  STATUS_FRAGMENT,
  STATUS_LIST_QUERY,
} from './status.gql';

export const useStatusList = () => {
  const { data } = useQuery(STATUS_LIST_QUERY);
  return {
    statusList:
      data?.statusList.map(item => getFragmentData(STATUS_FRAGMENT, item)) ??
      [],
  };
};

export const useStatus = () => {
  const [statusMap, setStatusMap] = useState<Map<number, StatusFragment>>(
    new Map(),
  );
  const [statusList, setStatusList] = useState<StatusDto[]>([]);

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
    skip: statusMap.size > 0,
  });
  useEffect(() => {
    if (statusListData) {
      setStatusMap(
        new Map(
          getFragmentData(STATUS_FRAGMENT, statusListData?.statusList).map(
            item => {
              return [item.id, item];
            },
          ),
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
            setStatusMap(statusMap => {
              (
                getFragmentData(STATUS_FRAGMENT, data?.moveStatus) ?? []
              ).forEach(item => {
                statusMap.set(item.id, item);
              });
              return new Map(statusMap.entries());
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
