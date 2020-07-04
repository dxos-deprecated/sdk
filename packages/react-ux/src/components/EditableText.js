//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: ({ variant }) => {
    return {
      ...theme.typography[variant],
      letterSpacing: 0,
      color: 'inherit'
    };
  },

  readonly: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  input: {
    letterSpacing: 0, // NOTE: For some elements (e.g., h1) Chrome render spaces 1px wider than in normal divs.
    height: 'inherit',
    padding: 0
  },

  placeholder: {
    opacity: 0.5
  }
}));

/**
 * Editable text field.
 */
const EditableText = ({
  classes: clazzes = {},
  value,
  placeholder = 'fucker',
  disabled = false,
  variant = 'body1',
  onUpdate
}) => {
  const classes = useStyles({ variant });
  const [editable, setEditable] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleUpdate = newValue => {
    if (value === undefined && !newValue) {
      return;
    }

    if (newValue !== value) {
      onUpdate(newValue);
    }
  };

  const handleChange = ({ target: { value } }) => {
    setText(value);
  };

  const handleKeyDown = ({ target: { value }, key }) => {
    switch (key) {
      case 'Enter': {
        setText(value);
        setEditable(false);
        handleUpdate(value);
        break;
      }

      case 'Escape': {
        setEditable(false);
        break;
      }

      default:
    }
  };

  const handleBlur = ({ target: { value } }) => {
    setText(value);
    setEditable(false);
    handleUpdate(value);
  };

  if (editable) {
    return (
      <TextField
        value={text || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        fullWidth
        InputProps={{
          disableUnderline: true,
          classes: {
            root: clsx(classes.root, clazzes.root),
            input: classes.input
          },
          inputProps: {
            spellCheck: false
          }
        }}
      />
    );
  }

  return (
    <Typography
      classes={{ root: clsx(classes.root, classes.readonly, !text && classes.placeholder, clazzes.root) }}
      variant={variant}
      onClick={disabled ? null : () => setEditable(true)}
    >
      {text || placeholder}
    </Typography>
  );
};

export default EditableText;
