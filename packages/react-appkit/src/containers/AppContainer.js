//
// Copyright 2020 DXOS.org
//

import React, { createRef, useEffect, useState } from 'react';
import { HotKeys, getApplicationKeyMap } from 'react-hotkeys';
import { useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import DebugIcon from '@material-ui/icons/BugReport';
import ConnectedIcon from '@material-ui/icons/Wifi';

import { useConfig } from '@dxos/react-client';
import { FullScreen } from '@dxos/react-ux';

import { DebugPanel, KeyMap, Layout, Sidebar, StatusBar } from '../components';
import { useErrorReducer, useLayoutReducer } from '../hooks';
import AppBar from './AppBar';
import RedeemDialog from './RedeemDialog';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden'
  }
}));

/**
 * Main application container.
 */
const AppContainer = ({
  appBarContent,
  sidebarContent,
  children,
  onSettingsOpened,
  onHomeNavigation,
  onPartyHomeNavigation,
  onPartyFromFile,
  onPartyFromIpfs,
  onPartiesSettingsOpen
}) => {
  const classes = useStyles();
  const config = useConfig();
  const { topic } = useParams(); // TODO(burdon): Remove and make component?
  const [{ exceptions: errors }, setErrors] = useErrorReducer();
  const [{ showSidebar, showDebug }, setLayout] = useLayoutReducer();
  const [showKeyMap, setShowKeyMap] = useState(false);
  const hotKeys = createRef();
  const [redeemOpen, setRedeemOpen] = useState(false);

  useEffect(() => {
    hotKeys.current.focus();
  }, []);

  // TODO(burdon): Tie actions to Hotkeys.
  const actions = [
    {
      isActive: () => Boolean(showDebug),
      handler: () => setLayout({ showDebug: !showDebug }),
      title: 'Show Config Panel',
      Icon: DebugIcon
    }
  ];

  const indicators = [
    {
      // TODO(burdon): Get connection status.
      isActive: () => false,
      Icon: ConnectedIcon
    }
  ];

  const keyMap = {
    debug: {
      name: 'Toggle debug panel',
      sequences: ['command+/']
    },

    sidebar: {
      name: 'Toggle sidebar',
      sequences: ['command+\'']
    },

    keyMap: {
      name: 'Show keymap',
      sequences: ['command+.']
    }
  };

  const keyHandlers = {
    debug: () => {
      setLayout({ showDebug: !showDebug });
    },

    sidebar: () => {
      setLayout({ showSidebar: !showSidebar });
    },

    keyMap: () => {
      setShowKeyMap(!showKeyMap);
    }
  };

  return (
    <FullScreen>
      <HotKeys
        allowChanges
        keyMap={keyMap}
        handlers={keyHandlers}
        innerRef={hotKeys}
        className={classes.root}
      >
        <Layout
          appBar={(
            <AppBar
              topic={topic}
              elevation={0}
              onToggleNav={sidebarContent ? () => setLayout({ showSidebar: !showSidebar }) : undefined}
              onSettingsOpened={onSettingsOpened}
              onHomeNavigation={onHomeNavigation}
              onPartyHomeNavigation={onPartyHomeNavigation}
              onPartyFromFile={onPartyFromFile}
              onPartyFromIpfs={onPartyFromIpfs}
              onRedeemOpen={() => setRedeemOpen(true)}
              onPartiesSettingsOpen={onPartiesSettingsOpen}
            >
              {appBarContent}
            </AppBar>
          )}
          leftSidebar={sidebarContent && {
            open: Boolean(showSidebar),
            width: 250,
            component: (
              <Sidebar>
                {sidebarContent}
              </Sidebar>
            )
          }}
          rightSidebar={{
            open: Boolean(showDebug),
            width: 350,
            component: <DebugPanel />
          }}
          statusBar={(
            <StatusBar
              actions={actions}
              indicators={indicators}
              meta={config.build?.version}
              errors={errors}
              onResetErrors={() => setErrors()}
            />
          )}
        >
          {children}
        </Layout>

        <KeyMap keyMap={getApplicationKeyMap()} showKeyMap={showKeyMap} onClose={() => setShowKeyMap(false)} />

        <RedeemDialog onClose={() => setRedeemOpen(false)} open={redeemOpen} />
      </HotKeys>
    </FullScreen>
  );
};

export default AppContainer;
