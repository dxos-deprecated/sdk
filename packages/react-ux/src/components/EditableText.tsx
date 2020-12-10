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
}: {
  value: string,
  onUpdate: (value: string) => void,
  disabled: boolean,
  bareInput: boolean
}) => {
  const [editable, setEditable] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleUpdate = (newValue: string) => {
    if (value === undefined && !newValue) {
      return;
    }

    if (newValue !== value) {
      onUpdate(newValue);
    }
  };

  const handleChange = ({ target: { value } }: { target: { value: string }}) => {
    setText(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const textField = event.target as HTMLTextAreaElement;
    const { key } = event;
    const { value } = textField;

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

  const handleBlur = ({ target: { value } }: { target: { value: string }}) => {
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
        inputProps={{
          inputprops: {
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
        onClick={disabled ? undefined : () => setEditable(true)}
        fullWidth
        inputProps={{
          inputprops: {
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
      onClick={disabled ? undefined : () => setEditable(true)}
      fullWidth
      inputProps={{
        inputprops: {
          spellCheck: false
        }
      }}
    />
  );
};

export default EditableText;
