//
// Copyright 2020 DXOS.org
//

import React, { createRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HotKeys, getApplicationKeyMap } from 'react-hotkeys';

import { makeStyles } from '@material-ui/core/styles';
import DebugIcon from '@material-ui/icons/BugReport';
import PeopleIcon from '@material-ui/icons/People';
import ConnectedIcon from '@material-ui/icons/Wifi';

import { useConfig } from '@dxos/react-client';
import { FullScreen } from '@dxos/react-ux';

import { KeyMap, Layout, StatusBar } from '../components';
import { Action, useErrorReducer, useLayoutReducer, useActionHandler } from '../hooks';

import AppBar from './AppBar';
import DebugPanel from './DebugPanel';
import Sidebar from '../components/Sidebar';

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
const AppContainer = ({ appBarContent, sidebarContent, children, onSettingsOpened, onHomeNavigation }) => {
  const classes = useStyles();
  const config = useConfig();
  const { topic } = useParams(); // TODO(burdon): Remove and make component?
  const [{ exceptions: errors }, setErrors] = useErrorReducer();
  const [{ showSidebar, showDebug }, setLayout] = useLayoutReducer();
  const [showKeyMap, setShowKeyMap] = useState(false);
  const handleAction = useActionHandler();
  const hotKeys = createRef();

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

  if (topic) {
    actions.push({
      handler: () => handleAction(Action.SHOW_MEMBERS, { topic }),
      title: 'Show members',
      Icon: PeopleIcon
    });
  }

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
      </HotKeys>
    </FullScreen>
  );
};

export default AppContainer;
