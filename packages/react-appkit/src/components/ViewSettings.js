//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { EditableText } from '@dxos/react-ux';

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

const ViewSettings = ({ router, viewModel, topic, viewId, pads }) => {
  const classes = useStyles();
  const item = viewModel.getById(viewId);

  const pad = item ? pads.find(pad => pad.type === item.type) : undefined;

  const handleDone = () => {
    router.push({ topic, item: viewId });
  };

  return (
    <Card className={classes.root}>
      <CardHeader title='View Settings' />
      <CardContent className={classes.contentRoot}>
        {item && (
          <EditableText
            autoFocus
            fullWidth
            label='Name'
            variant='outlined'
            value={item.displayName}
            className={classes.settingItem}
            onUpdate={value => viewModel.renameView(viewId, value)}
          />
        )}
        {pad && (
          <TextField
            fullWidth
            disabled
            label='Type'
            variant='outlined'
            value={pad.displayName}
            className={classes.settingItem}
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
  );
};

export default ViewSettings;
