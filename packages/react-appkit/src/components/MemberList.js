//
// Copyright 2020 DXOS.org
//

import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';

import { humanize } from '@dxos/crypto';

export const MemberList = ({ party }) => {
  const sorter = (a, b) => (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : a.isMe ? -1 : 1);

  return (
    <List
      subheader={(
        <ListSubheader>
          Party members
        </ListSubheader>
      )}
    >
      {party.members.sort(sorter).map((member) => (
        <ListItem key={member.publicKey}>{member.displayName || humanize(member.publicKey)}</ListItem>
      ))}
    </List>
  );
};

export default MemberList;
