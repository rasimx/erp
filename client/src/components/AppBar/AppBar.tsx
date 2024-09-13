import { Button, Container, Flex, Menu } from '@mantine/core';
import React from 'react';

import CustomLink from '../CustomLink';
import { ProductBatchPageControl } from '../ProductBatchPage/ProductBatchPageControl';
// import { Link } from 'react-router-dom';
import classes from './AppBar.module.scss';

export const AppBar = () => {
  return (
    <Container fluid component="header" className={classes.header}>
      <div className={classes.inner}>
        <CustomLink
          to="/client/public"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          ERP
        </CustomLink>
        <ProductBatchPageControl />
        <Menu>
          <Menu.Target>
            <Button>Меню</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={CustomLink} to="/batch/">
              Партии
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </Container>
  );
};