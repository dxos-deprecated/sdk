//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { EditableText } from '@dxos/react-ux';
import { SvgIconComponent } from '@material-ui/icons';
import { Item } from '@dxos/echo-db';
import { Model } from '@dxos/model-factory';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 400
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  margin: {
    marginBottom: theme.spacing(2)
  }
}));

type ItemSettingsPropsType = {
  open: boolean,
  onClose: ({ name }: { name: string }) => void,
  onCancel: () => void,
  item: Item<M extends Model<any>>,
  closingDisabled: boolean,
  icon: SvgIconComponent,
  children: React.ReactNode
}

const ItemSettings = ({ open, onClose, onCancel, item, closingDisabled, icon, children = null }: ItemSettingsPropsType) => {
  const classes = useStyles();
  const [name, setName] = useState('');

  useEffect(() => {
    setName(item ? item.model.getProperty('title') : '');
  }, [item]);

  const handleClose = () => {
    if (closingDisabled) {
      return;
    }

    onClose({ name });
  };

  return (
    <Dialog classes={{ paper: classes.root }} open={open} maxWidth='md' onClose={onCancel}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          {icon}
          <Typography variant='h5' className={classes.title}>Settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <EditableText
          fullWidth
          label='Name'
          variant='outlined'
          value={name}
          className={classes.margin}
          onUpdate={(value: string) => setName(value)}
        />

        {/* Custom content. */}
        <div className={classes.margin}>
          {children}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleClose} color='primary' disabled={closingDisabled}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemSettings;
