//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { LeftDrawer, RightDrawer } from '@dxos/react-ux';

const sidebarDefaults = {
  open: false,
  width: 500
};

/**
 * Main layout.
 */
const Layout = ({
  leftSidebar,
  rightSidebar,
  appBar,
  statusBar,
  children
}: {
  leftSidebar: any[],
  rightSidebar: any[],
  appBar: React.ReactNode,
  statusBar: React.ReactNode,
  children: React.ReactNode
}) => {
  const leftSidebarProps = { ...sidebarDefaults, ...leftSidebar };
  const rightSidebarProps = { ...sidebarDefaults, ...rightSidebar };

  return (
    <>
      <RightDrawer {...rightSidebarProps}>
        {appBar}

        <LeftDrawer {...leftSidebarProps}>
          {children}
        </LeftDrawer>

        {statusBar}
      </RightDrawer>
    </>
  );
};

export default Layout;
