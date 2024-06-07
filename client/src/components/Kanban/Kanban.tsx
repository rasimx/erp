import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useAppDispatch, useAppSelector } from '../../hooks';
import AddOperation from './AddOperation/AddOperation';
import AddProductBatch from './AddProductBatch/AddProductBatch';
import KanbanColumn from './KanbanColumn';
import KanbanItem from './KanbanItem';
import KanbanModal from './KanbanModal';
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

const classes: Record<string, CSSProperties> = {
  board: {
    display: 'flex',
    margin: '0 auto',
    width: '90vw',
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
  },
  column: {
    minWidth: 200,
    width: '18vw',
    height: '80vh',
    margin: '0 auto',
    backgroundColor: '#FCC8B2',
  },
  columnHead: {
    textAlign: 'center',
    padding: 10,
    fontSize: '1.2em',
    color: '#fff',
    backgroundColor: '#4da9c5',
  },
  item: {
    padding: 10,
    margin: 10,
    fontSize: '0.8em',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
};

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
    <main>
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
        <section style={classes.board}>
          {statusList.map(status => (
            <KanbanColumn key={status.id} status={status}>
              <div style={classes.column}>
                <div style={classes.columnHead}>
                  {status.title}{' '}
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      onClickDeleteBtn(status.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div>
                  {productBatchList
                    .filter(item => item.statusId === status.id)
                    .map(item => (
                      <KanbanItem item={item} key={item.id} />
                    ))}
                </div>
              </div>
            </KanbanColumn>
          ))}
        </section>
      </DndProvider>
      <KanbanModal />
      <SplitProductBatchModal />
    </main>
  );
};

export default Kanban;
