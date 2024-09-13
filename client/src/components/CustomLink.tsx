import * as React from 'react';
import { FC, forwardRef, ReactNode } from 'react';
import { Link as RouterLink, LinkProps, parsePath } from 'react-router-dom';

import { useAppContext } from './App/AppContext';

type Props = LinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    external?: boolean;
    children?: ReactNode;
  };

export const CustomLink: FC<Props> = forwardRef(props => {
  const { external } = props;
  const { basename } = useAppContext();

  const to = typeof props.to === 'string' ? parsePath(props.to) : props.to;

  const pathname = to.pathname;

  if (
    !external &&
    pathname?.startsWith('/') &&
    !pathname?.startsWith('//') &&
    basename
  ) {
    to.pathname = `/${basename.replace(/^\/|\/$/g, '')}/${pathname.substring(1)}`;
    console.log(to.pathname);
  }

  return <RouterLink {...props} to={to} />;
});

export default CustomLink;
