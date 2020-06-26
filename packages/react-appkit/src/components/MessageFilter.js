//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles(() => ({
  input: {
    display: 'flex',
    flex: 1
  }
}));

const MessageFilter = ({ types, onChange }) => {
  const classes = useStyles();

  // TODO(burdon): Bug: Material-UI: A component is changing an uncontrolled Autocomplete to be controlled.
  return (
    <Autocomplete
      className={classes.input}
      size='small'
      freeSolo
      autoComplete
      clearOnEscape
      options={types}
      renderInput={params => (
        <TextField {...params} label='type' variant='outlined' fullWidth />
      )}
      onInputChange={(event, value) => onChange(value)}
      onChange={(event, value) => onChange(value)}
    />
  );
};

export default MessageFilter;
