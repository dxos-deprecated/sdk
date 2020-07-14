//
// Copyright 2020 DXOS.org
//

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { Home } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { noop } from '@dxos/async';
import { keyToBuffer } from '@dxos/crypto';
import { useClient } from '@dxos/react-client';
import { AppContainer, usePads, useAppRouter } from '@dxos/react-appkit';

import { useViews } from '../hooks';
import Sidebar from './DefaultViewSidebar';

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 600,
    minHeight: 414,
    padding: theme.spacing(5),
    borderRadius: '8px',
    textAlign: 'center',
    justifyContent: 'space-between'
  },
  itemText: {
    paddingRight: 150
  },
  actions: {
    justifyContent: 'flex-end',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  contentRoot: {
    display: 'flex',
    flexDirection: 'column'
  },
  table: {
    minWidth: 500
  },
  settingItem: {
    marginTop: theme.spacing(5)
  }
}));

const ViewSettings = () => {
  const router = useAppRouter();
  const classes = useStyles();
  const { topic, item: viewId } = useParams();
  const [pads] = usePads();
  const { model } = useViews(topic);
  const item = model.getById(viewId);
  const client = useClient();

  const pad = item ? pads.find(pad => pad.type === item.type) : undefined;

  useEffect(() => {
    if (topic) {
      client.partyManager.openParty(keyToBuffer(topic)).then(noop);
    }
  }, [topic]);

  const handleDone = () => {
    router.push({ topic, item: viewId });
  };

  const appBarContent = (
    <IconButton color='inherit'>
      <Home onClick={() => router.push({ path: '/home' })} />
    </IconButton>
  );

  return (
    <AppContainer
      appBarContent={appBarContent}
      sidebarContent={<Sidebar />}
    >
      <Card className={classes.root}>
        <CardHeader title='View Settings' />
        <CardContent className={classes.contentRoot}>
          {/* TODO(rzadp): Use EditableText after https://github.com/dxos/teamwork/issues/180 */}
          {item && (
            <TextField
              className={classes.settingItem}
              fullWidth
              label='Name'
              variant='outlined'
              value={item.displayName}
              onChange={e => model.renameView(viewId, e.target.value)}
            />
          )}
          {pad && (
            <TextField
              className={classes.settingItem}
              fullWidth
              label='Type'
              disabled
              variant='outlined'
              value={pad.displayName}
            />
          )}
        </CardContent>
        <CardActions className={classes.actions}>
          <Button
            color='primary'
            variant='text'
            disabled={false}
            onClick={handleDone}
          >
            Done
          </Button>
        </CardActions>
      </Card>
    </AppContainer>
  );
};

export default ViewSettings;
