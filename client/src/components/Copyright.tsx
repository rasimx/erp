import * as React from 'react';

const Copyright = (props: any) => {
  return (
    <div color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <a color="inherit" href="https://site.com/">
        Your Website
      </a>{' '}
      {new Date().getFullYear()}
      {'.'}
    </div>
  );
};

export default Copyright;
