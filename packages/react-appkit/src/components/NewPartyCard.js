//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';

import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    height: 320,
    padding: theme.spacing(5),
    borderRadius: '8px',
    textAlign: 'center'
  },
  addButton: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    marginTop: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing(4)
  },
  addIcon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: theme.palette.grey[300]
  },
  addSubtitle: {
    color: theme.palette.grey[300],
    marginTop: theme.spacing(3)
  }
}));

// TODO(burdon): Use ACTUAL party card with option (i.e., DON'T duplicate CSS which WILL break).
const NewPartyCard = ({ onNewParty }) => {
  const classes = useStyles();

  return (
    <>
      <Card className={classes.card}>
        <IconButton className={classes.addButton} onClick={onNewParty}>
          <AddIcon className={classes.addIcon} />
        </IconButton>
        <Typography className={classes.addSubtitle} variant='h5'>New Party</Typography>
      </Card>
    </>
  );
};

export default NewPartyCard;
