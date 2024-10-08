import { values } from 'lodash';
import React, { FC, useEffect } from 'react';

import classes from './Step_3.module.scss';
import { FormProps, useFormState } from './types';

export type Props = {};

const Step_1: FC<Props & FormProps> = props => {
  const { setValues, errors, values } = props;
  const { state, newBathes } = useFormState();
  console.log(errors);
  console.log('values', values);

  useEffect(() => {
    if (newBathes.length) {
      setValues(values => ({
        ...values,
        items: newBathes.map(item => ({
          productId: state.product?.id,
          count: item.count,
          sourceIds: item.sources.map(({ id }) => id),
        })),
      }));
    } else {
      setValues(values => ({ ...values, items: [] }));
    }
  }, [newBathes, setValues]);

  console.log(newBathes);

  return (
    <div>
      будут созданы следуюущие партии:
      <div>
        {newBathes.map(item => (
          <div className={classes.newBatchItem}>
            <div className={classes.header}>кол-во: {item.count}</div>
            <div className={classes.main}>
              {item.sources.map(source => (
                <div className={classes.source}>
                  x{source.qty} <br />
                  sku: {source.sku} <br />
                  id: {source.id} <br />
                  selected count: {source.selectedCount}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step_1;
