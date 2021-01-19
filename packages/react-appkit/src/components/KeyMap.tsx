//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import grey from '@material-ui/core/colors/grey';
import yellow from '@material-ui/core/colors/yellow';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  keys: {
    marginBottom: theme.spacing(4),

    '& td': {
      verticalAlign: 'top',
      padding: 4,
      fontSize: 16,
      color: grey[200]
    }
  },

  key: {
    fontFamily: 'monospace',
    color: yellow[200]
  }
}));

const KeyMap = ({
  keyMap,
  showKeyMap,
  onClose
}: {
  keyMap: Record<string, { sequences: { sequence: string }[], name: string}>,
  showKeyMap: boolean,
  onClose: () => void
}) => {
  const classes = useStyles();

  // https://github.com/greena13/react-hotkeys#Displaying-a-list-of-available-hot-keys
  const message = (
    <table>
      <tbody>
        {Object.keys(keyMap).map(key => {
          const { sequences, name } = keyMap[key];

          return name && (
            <tr key={key}>
              <td>{name}</td>
              {/* eslint-disable-next-line react/no-array-index-key */}
              <td className={classes.key}>
                {sequences.map(({ sequence }, i) => <div key={i} className={classes.key}>{sequence}</div>)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <Snackbar
      className={classes.keys}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={showKeyMap}
      message={message}
      onClose={onClose}
      ContentProps={{
        'aria-describedby': 'message-id'
      }}
    />
  );
};

export default KeyMap;
