import { Tooltip } from 'primereact/tooltip';
import React, { FC, useRef } from 'react';

import { ProductBatch } from '../../api/product-batch/product-batch.gql';
import { ProductBatchDetail } from '../../api/product-batch/product-batch-detail.gql';
import { ProportionType } from '../../gql-types/graphql';
import classes from './DataCell.module.scss';
import { useOperationFormContext } from './GroupOperationFormContext';

export type Props = {
  type: ProportionType;
  row: ProductBatch | ProductBatchDetail;
  label: string;
  getValue?: (value: number) => number;
};

const DataCell: FC<Props> = ({ type, row, label, getValue }) => {
  const context = useOperationFormContext();
  if (!context) return;

  const data = context && context.proportionMap[type].get(row.id);
  if (!data) throw new Error();

  const ref = useRef<HTMLTableDataCellElement>(null);

  return (
    <>
      <Tooltip target={ref.current ?? undefined}>
        Цена за единицу товара - {(data.cost / row.count).toFixed(2)} р{' '}
        {data.cost} {row.count}
      </Tooltip>
      <td style={{ padding: 0, border: '1px solid gray' }} ref={ref}>
        <div className={classes.value}>
          <div>
            {(getValue ? getValue(data.value) : data.value).toFixed(2)} {label}
          </div>
          <div>{data.proportion} %</div>
          <div>{Number.isNaN(data.cost) ? '—' : data.cost} р</div>
        </div>
      </td>
    </>
  );
};

export default DataCell;
