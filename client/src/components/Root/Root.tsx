import { AppShell } from '@mantine/core';
import React, { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { RootBar } from '../RootBar/RootBar';
import classes from './Root.module.scss';

const Root: FC = () => {
  return (
    // <AppShell header={{ height: 65, collapsed: !pinned, offset: false }} padding="md">
    //   <AppShell.Header>
    //     <ProductBatchGroup h="100%" px="md">
    //       <MantineLogo size={30} />
    //     </ProductBatchGroup>
    //   </AppShell.Header>
    //
    //   <AppShell.Main pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}>
    //     <Outlet />
    //   </AppShell.Main>
    // </AppShell>

    <div className={classes.root}>
      <RootBar />
      <main className={classes.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Root;
