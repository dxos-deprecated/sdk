//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';

/**
 * Editable text field.
 */
const EditableText = ({
  value,
  onUpdate,
  disabled = false,
  bareInput = false,
  ...rest
}) => {
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
        {...rest}
        value={text || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        fullWidth
        InputProps={{
          inputProps: {
            spellCheck: false
          }
        }}
      />
    );
  }

  if (bareInput) {
    return (
      <InputBase
        {...rest}
        value={text || ''}
        disabled={disabled}
        onClick={disabled ? null : () => setEditable(true)}
        fullWidth
        InputProps={{
          inputProps: {
            spellCheck: false
          }
        }}
      />
    );
  }

  return (
    <TextField
      {...rest}
      value={text || ''}
      disabled={disabled}
      onClick={disabled ? null : () => setEditable(true)}
      fullWidth
      InputProps={{
        inputProps: {
          spellCheck: false
        }
      }}
    />
  );
};

export default EditableText;
