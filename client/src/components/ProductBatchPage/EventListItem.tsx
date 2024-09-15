import React, { FC } from 'react';

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
      {/*<Collapse in={open}>*/}
      {/*  <div>*/}
      {/*    <pre>{JSON.stringify(event.data, null, 2)}</pre>*/}
      {/*  </div>*/}
      {/*</Collapse>*/}
    </div>
  );
};

export default EventListItem;
