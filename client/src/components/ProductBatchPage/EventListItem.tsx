import { Card, Collapse } from '@mui/material';
import Box from '@mui/material/Box';
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
    <Card sx={{ p: 1, mb: 1 }}>
      <Box onClick={handleClick} sx={{ cursor: 'pointer' }}>
        {event.type}
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box>
          <pre>{JSON.stringify(event.data, null, 2)}</pre>
        </Box>
      </Collapse>
    </Card>
  );
};

export default EventListItem;
