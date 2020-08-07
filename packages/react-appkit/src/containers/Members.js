//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { useParty } from '@dxos/react-client';

import MemberTable from '../components/MemberTable';
import AppContainer from './AppContainer';
import DefaultSidebar from './DefaultSidebar';

// TODO(burdon): Remove.
// TODO(telackey): This UI is for test/demo purposes.

/**
 * Displays Members for the current party.
 */
const Members = () => {
  const party = useParty();

  return (
    <AppContainer sidebarContent={<DefaultSidebar />}>
      <MemberTable party={party} />
    </AppContainer>
  );
};

export default Members;
