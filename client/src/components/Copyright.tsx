import { Title } from '@mantine/core';
import * as React from 'react';

const Copyright = (props: any) => {
  return (
    <Title variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <a color="inherit" href="https://site.com/">
        Your Website
      </a>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Title>
  );
};

export default Copyright;
