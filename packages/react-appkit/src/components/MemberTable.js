//
// Copyright 2020 DXOS.org
//

// THIS COMPONENT IS NOT USED ANYWHERE

import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import { makeStyles } from '@material-ui/core/styles';
import YesIcon from '@material-ui/icons/CheckCircleOutline';
import NoIcon from '@material-ui/icons/RadioButtonUnchecked';

import { humanize } from '@dxos/crypto';
import { truncateString } from '@dxos/debug';

// TODO(burdon): Move to dxos/react-ux.
const BooleanIcon = ({ yes = false, error = false }) => {
  return (yes
    ? <YesIcon style={{ color: green[500] }} />
    : <NoIcon style={{ color: error ? red[500] : 'transparent' }} />
  );
};

// TODO(telackey): This UI is for test/demo purposes.

const useStyle = makeStyles(() => ({
  table: {
    tableLayout: 'fixed',
    '& .MuiTableCell-root': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '& th': {
      fontVariant: 'all-petite-caps'
    }
  },

  mono: {
    fontFamily: 'monospace',
    fontSize: 'large'
  },

  colName: {
    width: 80
  },
  colKey: {
    width: 180
  },
  colOwn: {
    width: 80
  }
}));

const MemberTable = ({ party, onMemberSelect }) => {
  const classes = useStyle();

  const sorter = (a, b) => (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : a.isMe ? -1 : 1);

  return (
    <Table stickyHeader size='small' className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.colName}>Name</TableCell>
          <TableCell className={classes.colKey}>Admitted By</TableCell>
          <TableCell className={classes.colOwn}>Me</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {party.members.sort(sorter).map((member) => {
          const formatDisplay = (key, name) => (
            key ? `${name || humanize(key)} (${truncateString(key.toString(), 8)})` : ''
          );

          const key = member.publicKey.toString();
          let admittedBy = '';
          if (member.admittedBy) {
            if (party.key.equals(member.admittedBy)) {
              admittedBy = formatDisplay(member.admittedBy, party.displayName);
            } else {
              const match = party.members.find(other => other.publicKey.equals(member.admittedBy));
              admittedBy = match ? formatDisplay(member.admittedBy, match.displayName) : formatDisplay(member.admittedBy);
            }
          }

          return (
            <TableRow key={key} onClick={onMemberSelect ? () => onMemberSelect(member) : undefined}>
              <TableCell className={classes.colName}>{formatDisplay(member.publicKey, member.displayName)}</TableCell>
              <TableCell className={classes.colName} title={admittedBy}>
                {admittedBy}
              </TableCell>
              <TableCell>
                <BooleanIcon yes={member.isMe} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default MemberTable;
