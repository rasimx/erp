import NiceModal from '@ebay/nice-modal-react';
import Box from '@mui/material/Box';
import React from 'react';

import withDrawer from '../withDrawer';

export interface Props {
  productBatchId: number;
}

export const ProductBatchInfo = React.memo<Props>(props => {
  const { productBatchId } = props;

  return (
    <Box
      sx={{
        width: '500px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      Тут будет подробное описание партии
    </Box>
  );
});

export default NiceModal.create(withDrawer(ProductBatchInfo));
