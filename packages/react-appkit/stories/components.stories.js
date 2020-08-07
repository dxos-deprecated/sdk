//
// Copyright 2020 DXOS.org
//

import React, { useRef, useState, useEffect } from 'react';

import Box from '@material-ui/core/Box';
import DebugIcon from '@material-ui/icons/BugReport';
import ConnectedIcon from '@material-ui/icons/Wifi';

import { createKeyPair, keyToString } from '@dxos/crypto';

import { MemberAvatar, useAssets, StatusBar, NewViewCreationMenu } from '../src/components';
import { pads } from './common';

export default {
  title: 'Components'
};

export const withMemberAvatar = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: 'Test name'
  };

  return (
    <Box m={2}>
      <MemberAvatar member={member} />
    </Box>
  );
};

export const withNoDisplayName = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: undefined
  };

  return (
    <Box m={2}>
      <MemberAvatar member={member} />
    </Box>
  );
};

export const withImages = () => {
  const assets = useAssets();

  return (
    <Box m={2}>
      <img src={assets.getThumbnail(keyToString(createKeyPair().publicKey))} />
    </Box>
  );
};

export const withStatusBar = () => {
  const actions = [
    {
      isActive: () => false,
      handler: () => {},
      title: 'Mock debug',
      Icon: DebugIcon
    }
  ];

  const indicators = [
    {
      isActive: () => false,
      Icon: ConnectedIcon
    }
  ];

  return (
    <Box m={2}>
      <StatusBar
        actions={actions}
        indicators={indicators}
        meta='A storybook statusbar'
      />
    </Box>
  );
};

export const withNewViewCreationMenu = () => {
  const anchorEl = useRef();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => setInitialized(!!anchorEl.current), [anchorEl]);

  return (
    <Box m={2}>
      <div ref={anchorEl} />
      {initialized && (
        <NewViewCreationMenu
          open
          onClose={() => {}}
          onSelect={() => {}}
          pads={pads}
          anchorEl={anchorEl.current}
        />
      )}
    </Box>
  );
};
