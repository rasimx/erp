import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Divider, IconButton, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useAppDispatch, useAppSelector } from '@/hooks';

import AddOperation from './AddOperation/AddOperation';
import AddProductBatch from './AddProductBatch/AddProductBatch';
import KanbanColumn from './KanbanColumn';
import KanbanItem from './KanbanItem';
import {
  loadProductBatchListAsync,
  selectProductBatchList,
} from './product-batch.slice';
import SplitProductBatchModal from './SplitProductBatch/SplitProductBatchModal';
import {
  createStatusAsync,
  deleteStatusAsync,
  loadStatusListAsync,
  selectStatusList,
} from './status-list.slice';

const Kanban = () => {
  const productBatchList = useAppSelector(selectProductBatchList);
  const statusList = useAppSelector(selectStatusList);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadStatusListAsync());
    dispatch(loadProductBatchListAsync());
  }, []);

  const [newStatusName, setNewStatusName] = useState('');

  const onClickCreateBtn = useCallback(() => {
    void dispatch(createStatusAsync(newStatusName));
  }, [newStatusName]);

  const onClickDeleteBtn = useCallback(
    (id: number) => {
      void dispatch(deleteStatusAsync(id));
      setNewStatusName('');
    },
    [newStatusName],
  );

  return (
    <Box sx={{ p: 2 }}>
      <header> Kanban Board </header>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        size="small"
        sx={{ marginRight: 1 }}
        value={newStatusName}
        onChange={ev => {
          setNewStatusName(ev.target.value);
        }}
      />
      <Button variant="contained" onClick={onClickCreateBtn}>
        Добавить колонку
      </Button>
      <br />
      <br />
      <AddOperation />
      <AddProductBatch />
      <br />
      <br />
      <DndProvider backend={HTML5Backend}>
        <Stack
          direction="row"
          spacing={0}
          alignItems="stretch"
          justifyContent="flex-start"
        >
          {statusList.map(status => (
            <>
              <KanbanColumn key={status.id} status={status}>
                <Box sx={{ background: '#FAFAFA', p: 1, textAlign: 'center' }}>
                  {status.title}{' '}
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      onClickDeleteBtn(status.id);
                    }}
                  >
                    <DeleteIcon color="warning" />
                  </IconButton>
                </Box>
                <Stack spacing={1} sx={{ p: 1 }}>
                  {productBatchList
                    .filter(item => item.statusId === status.id)
                    .map(item => (
                      <KanbanItem item={item} key={item.id} />
                    ))}
                </Stack>
              </KanbanColumn>
              <Divider orientation="vertical" variant="middle" flexItem />
            </>
          ))}
        </Stack>
      </DndProvider>
      <SplitProductBatchModal />
    </Box>
  );
};

export default Kanban;
