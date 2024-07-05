import { useQuery } from '@apollo/client';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Modal,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getFragmentData, graphql } from '@/gql-types';

import { SourceProductBatchFragment } from '../../gql-types/graphql';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export const F = graphql(`
  fragment SourceProductBatch on ProductBatchDto {
    id
    name
    status {
      id
      title
      order
    }
    statusId
    count
    order
  }
`);

export const QUERY = graphql(`
  query productParentBatchList($productId: Int!) {
    productBatchList(productId: $productId) {
      ...SourceProductBatch
    }
  }
`);

export interface Props {
  onChange: (data: SourceProductBatchFragment | undefined) => void;
  productId: number;
}

const SelectParentProductBatch: FC<Props> = ({ onChange, productId }) => {
  const [selected, setSelected] = useState<
    SourceProductBatchFragment | undefined
  >();
  const { data, loading } = useQuery(QUERY, { variables: { productId } });

  const items = useMemo(() => {
    const items = getFragmentData(F, data?.productBatchList);
    return items?.toSorted((a, b) => a.order - b.order) ?? [];
  }, [data]);

  const columns = useMemo(() => {
    const map = new Map<number, { id: number; title: string; order: number }>(
      items?.map(item => [item.status.id, item.status]),
    );
    return [...map.values()].toSorted((a, b) => a.order - b.order);
  }, [items]);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  const choice = useCallback(
    (id: SourceProductBatchFragment) => () => {
      setSelected(id);
      setIsOpenModal(false);
      onChange(id);
    },
    [onChange],
  );
  const clear = useCallback(() => {
    setSelected(undefined);
    console.log('aaaa');
  }, [onChange]);

  return (
    <>
      <ButtonGroup
        variant="contained"
        aria-label="Button group with a nested menu"
      >
        <Button
          onClick={() => {
            setIsOpenModal(true);
          }}
        >
          {selected?.id ?? `Выбрать донора`}
        </Button>
        {selected && (
          <Button size="small" onClick={clear}>
            <ClearIcon />
          </Button>
        )}
      </ButtonGroup>

      <Modal
        open={isOpenModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Выбрать исходную партию
          </Typography>
          <Box>
            <Stack
              direction="row"
              spacing={2}
              alignContent="stretch"
              sx={{ flexGrow: 1, maxHeight: '100%' }}
            >
              {columns.map((column, index) => (
                <Paper elevation={3} variant="elevation" key={column.id}>
                  <Box
                    sx={{
                      background: '#FAFAFA',
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    {column.title}
                  </Box>
                  <Box sx={{ height: '100%', overflow: 'auto', flexGrow: 1 }}>
                    <Stack spacing={2} sx={{ p: 1 }}>
                      {items
                        .filter(item => item.statusId == column.id)
                        .map(item => (
                          <Card
                            sx={{ cursor: 'pointer' }}
                            key={item.id}
                            onClick={choice(item)}
                          >
                            {item.id}: {item.order}
                          </Card>
                        ))}
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SelectParentProductBatch;
