import { useQuery } from '@apollo/client';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import React, { type FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { StoreType } from '@/gql-types/graphql';

import { STORE_STATE_QUERY } from './store.gql';
import StoreItem from './StoreItem';

interface Props {}

const StoreComponent: FC<Props> = ({}) => {
  const { storeId } = useParams();
  const { data, loading, error } = useQuery(STORE_STATE_QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      storeInput: { storeId: Number(storeId), storeType: StoreType.ozon },
    },
  });

  const items = useMemo(() => {
    return data?.storeState.flatMap(storeItem => storeItem.items);
  }, [data]);

  return (
    <Box sx={{ height: '90vh' }}>
      <Stack
        spacing={1}
        sx={{ p: 1, width: '100%', overflow: 'auto', height: '100%' }}
        direction="row"
      >
        {items?.map(item => (
          <StoreItem
            storeItem={item}
            storeId={Number(storeId)}
            storeType={StoreType.ozon}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default StoreComponent;
