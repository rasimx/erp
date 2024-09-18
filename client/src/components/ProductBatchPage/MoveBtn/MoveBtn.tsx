import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';

import { SortableData } from '../../KanbanBoard/types';
import classes from './MoveBtn.module.scss';

type Props = {
  sortableData?: SortableData;
};

export const MoveBtn: FC<Props> = ({ sortableData }) => {
  return (
    <div
      ref={sortableData?.setActivatorNodeRef}
      {...sortableData?.listeners}
      className={classes.moveBtn}
    >
      <FontAwesomeIcon icon={faUpDownLeftRight} />
    </div>
  );
};
