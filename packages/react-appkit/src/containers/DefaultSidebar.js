//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { useParams } from 'react-router-dom';

import { useParties } from '@dxos/react-client';

import { useAppRouter } from '../hooks';
import PartyTree from '../components/PartyTree';

const DefaultSidebar = () => {
  const router = useAppRouter();
  const parties = useParties();
  const { path, topic } = useParams();

  const handleSelect = topic => {
    router.push({ path, topic });
  };

  return (
    <PartyTree
      parties={parties}
      selected={topic}
      onSelect={handleSelect}
    />
  );
};

export default DefaultSidebar;
