import styled from '@emotion/styled';
import {
  Box,
  Button,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import _ from 'lodash';
import React, { type FC, useCallback, useMemo, useState } from 'react';

import { ProportionType } from '@/gql-types/graphql';
import { useAppSelector } from '@/hooks';

import {
  ProductBatchStateItem,
  selectCheckedProductBatchList,
} from '../product-batch.slice';
import { createOperation } from './operation.api';

const Value = styled('div')`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  text-wrap: nowrap;
  height: 40px;
  line-height: 40px;
  width: 100%;

  div {
    flex-grow: 1;
    box-sizing: border-box;
    padding: 0 15px;

    &:nth-child(1) {
      background: antiquewhite;
      position: relative;
      padding-right: 10px;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-left: 10px solid transparent;
        border-bottom: 40px solid #eede93;
      }
    }

    &:nth-child(2) {
      background: #eede93;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-left: 10px solid transparent;
        border-bottom: 40px solid #efefef;
      }
    }

    &:nth-child(3) {
      font-weight: bold;
      background: #efefef;
    }
  }
`;

export interface Props {
  onSubmit: () => void;
}

export type ProductBatchOperationInputItem = {
  productBatchId: number;
  date: string;
  proportion: number | null;
};

type A = {
  productBatchId: number;
  proportion: number;
  cost: number;
  value: number;
};

type B = {
  [key in ProportionType]: Map<number, A>;
};

type DataCellProps = {
  type: ProportionType;
  row: ProductBatchStateItem;
  items: B;
  label: string;
  getValue?: (value: number) => number;
};

const DataCell: FC<DataCellProps> = ({ type, row, items, label, getValue }) => {
  const item = items[type].get(row.id);
  if (!item) throw new Error();

  return (
    <TableCell sx={{ padding: 0, border: '1px solid gray' }}>
      <Tooltip
        arrow
        title={
          <div>
            <div>
              Цена за единицу товара - {(item.cost / row.count).toFixed(2)} р
            </div>
          </div>
        }
      >
        <Value>
          <div>
            {getValue ? getValue(item.value) : item.value} {label}
          </div>
          <div>{item.proportion} %</div>
          <div>{(item.cost / 100).toFixed(2)} р</div>
        </Value>
      </Tooltip>
    </TableCell>
  );
};

const AddOperationForm: FC<Props> = ({ onSubmit }) => {
  const [name, setName] = React.useState<string>('');
  const [cost, setCost] = React.useState<number>(0);
  const [date, setDate] = React.useState<Date | null>(null);
  const selectedProductBatches = useAppSelector(selectCheckedProductBatchList);
  const [proportionType, setProportionType] = useState<ProportionType>(
    ProportionType.equal,
  );

  const percentages = useCallback(
    (
      field: keyof Pick<
        ProductBatchStateItem,
        'volume' | 'weight' | 'costPrice'
      >,
    ) => {
      const getValue = (item: ProductBatchStateItem) =>
        field == 'costPrice' ? item.costPrice * item.count : item[field];
      const totalSum = selectedProductBatches.reduce(
        (acc, item) => acc + getValue(item),
        0,
      );

      const percentages = selectedProductBatches.map(item => ({
        ...item,
        proportion: Math.floor((getValue(item) / totalSum) * 1000) / 10,
      }));

      const remainder =
        100 - percentages.reduce((acc, val) => acc + val.proportion, 0);

      percentages.sort((a, b) => b.proportion - a.proportion);

      if (remainder !== 0) {
        percentages[0].proportion = Number(
          (percentages[0].proportion + remainder).toFixed(2),
        );
      }

      percentages.sort((a, b) => a.id - b.id);
      return new Map(
        percentages.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: item.proportion,
            cost: Number((cost * item.proportion).toFixed(0)),
            value: getValue(item),
          },
        ]),
      );
    },
    [selectedProductBatches, cost],
  );

  const items = useMemo<B>(() => {
    return {
      [ProportionType.weight]: percentages('weight'),
      [ProportionType.volume]: percentages('volume'),
      [ProportionType.costPrice]: percentages('costPrice'),
      [ProportionType.manual]: percentages('costPrice'), // временно
      [ProportionType.equal]: new Map(
        selectedProductBatches.map(item => [
          item.id,
          {
            productBatchId: item.id,
            proportion: 100,
            cost: Number((cost * 100).toFixed(0)),
            value: cost,
          },
        ]),
      ), // временно
    };
  }, [percentages]);

  const onClickCreateBtn = useCallback(async () => {
    if (!name || !cost || !date) {
      throw new Error('invalid');
    }
    await createOperation({
      name,
      proportionType,
      productBatchProportions: [...items[proportionType].values()].map(item =>
        _.pick(item, ['productBatchId', 'proportion', 'cost']),
      ),
      cost,
      date: format(date, 'yyyy-MM-dd'),
    });

    onSubmit();
  }, [name, cost, date, proportionType]);

  const handleRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProportionType(event.target.value as ProportionType);
  };

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '40ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        required
        id="outlined-required"
        label="Название"
        value={name}
        onChange={event => {
          setName(event.target.value);
        }}
      />

      <TextField
        required
        id="outlined-required"
        type="number"
        label="стоимость за партию"
        value={cost}
        onChange={event => {
          setCost(Number(event.target.value));
        }}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          value={date}
          format="yyyy-MM-dd"
          onChange={value => {
            setDate(value);
          }}
        />
      </LocalizationProvider>
      <div>
        {selectedProductBatches.length > 1 && (
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow sx={{ textWrap: 'nowrap' }}>
                  <TableCell>Распределить стоимость</TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      checked={proportionType == ProportionType.weight}
                      onChange={handleRadio}
                      value={ProportionType.weight}
                    />
                    <span>По весу</span>
                  </TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      checked={proportionType == ProportionType.volume}
                      onChange={handleRadio}
                      value={ProportionType.volume}
                    />
                    <span>По объему</span>
                  </TableCell>
                  <TableCell>
                    <Radio
                      size="small"
                      checked={proportionType == ProportionType.costPrice}
                      onChange={handleRadio}
                      value={ProportionType.costPrice}
                    />
                    <span>По с/с</span>
                  </TableCell>
                  {/*<TableCell>*/}
                  {/*  <Radio*/}
                  {/*    size="small"*/}
                  {/*    checked={proportionType == ProportionType.manual}*/}
                  {/*    onChange={handleRadio}*/}
                  {/*    value={ProportionType.manual}*/}
                  {/*  />*/}
                  {/*  <span>Произвольно</span>*/}
                  {/*</TableCell>*/}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProductBatches.map(row => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <DataCell
                      items={items}
                      type={ProportionType.weight}
                      row={row}
                      label="кг"
                      getValue={value => value / 1000}
                    />
                    <DataCell
                      items={items}
                      type={ProportionType.volume}
                      row={row}
                      label="л"
                    />
                    <DataCell
                      items={items}
                      type={ProportionType.costPrice}
                      row={row}
                      label="руб"
                    />
                    {/*<TableCell sx={{ padding: '0 10px' }}>*/}
                    {/*  <Input />*/}
                    {/*</TableCell>*/}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/*{false && (
          <Table>
            <div>
              <div>
                <Radio
                  checked={proportionType == ProportionType.manual}
                  onChange={handleRadio}
                  value={ProportionType.manual}
                />
                По весу
              </div>
              {percentages(selectedProductBatches, 'weight').map(item => (
                <div>
                  <TextField
                    required
                    id="outlined-required"
                    label={item.productBatchId}
                    key={item.productBatchId}
                    value={item.proportion}
                    onChange={handleA(item.productBatchId)}
                  />
                </div>
              ))}
            </div>
            <div>
              <div>
                <Radio
                  checked={proportionType == ProportionType.weight}
                  onChange={handleRadio}
                  value={ProportionType.weight}
                />
                По весу
              </div>
              {items[ProportionType.weight].map(item => (
                <div key={item.productBatchId}>
                  <FormControl variant="standard">
                    <InputLabel htmlFor="input-with-icon-adornment">
                      {item.productBatchId}
                    </InputLabel>
                    <Input
                      id="input-with-icon-adornment"
                      value={item.cost}
                      onChange={handleA(item.productBatchId)}
                      startAdornment={
                        <InputAdornment position="start">
                          {item.proportion}%
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </div>
              ))}
            </div>
            <div>
              <div>
                <Radio
                  checked={proportionType == ProportionType.volume}
                  onChange={handleRadio}
                  value={ProportionType.volume}
                />
                По объему
              </div>
              {percentages(selectedProductBatches, 'volume').map(item => (
                <div>
                  <TextField
                    required
                    id="outlined-required"
                    label={item.productBatchId}
                    key={item.productBatchId}
                    value={item.cost}
                    onChange={handleA(item.productBatchId)}
                  />
                </div>
              ))}
            </div>
            <div>
              <div>
                <Radio
                  checked={proportionType == ProportionType.costPrice}
                  onChange={handleRadio}
                  value={ProportionType.costPrice}
                />
                По себестоимости
              </div>
              {percentages(selectedProductBatches, 'costPrice').map(item => (
                <div>
                  <TextField
                    required
                    id="outlined-required"
                    label={item.productBatchId}
                    key={item.productBatchId}
                    value={item.cost}
                    onChange={handleA(item.productBatchId)}
                  />
                </div>
              ))}
            </div>
          </Table>
        )}*/}
      </div>
      <Button variant="contained" onClick={onClickCreateBtn}>
        Добавить
      </Button>
    </Box>
  );
};

export default AddOperationForm;
