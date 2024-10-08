import React, { FC } from 'react';
import ReactJson from 'react-json-view';

import { EventFragment } from '../../gql-types/graphql';

export type Props = {
  event: EventFragment;
};

const EventListItem: FC<Props> = props => {
  const { event } = props;
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        {event.type}
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <ReactJson src={event.data} />
      </div>
    </div>
  );
};

export default EventListItem;
