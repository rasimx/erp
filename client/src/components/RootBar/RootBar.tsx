import { Button, Container, Flex, Menu } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';

import classes from './RootBar.module.scss';

export const RootBar = () => {
  return (
    <Container fluid component="header" className={classes.header}>
      <div className={classes.inner}>
        <Link
          to="/client/public"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          ERP
        </Link>

        <Menu>
          <Menu.Target>
            <Button>Меню</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} to="/batch">
              Партии
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </Container>
  );
};
