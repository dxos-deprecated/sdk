//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { List, ListItem, makeStyles } from '@material-ui/core';

import { humanize } from '@dxos/crypto';

import { MemberAvatar } from '.';

const useStyles = makeStyles(() => ({
  membersList: {
    maxHeight: 360,
    overflow: 'auto'
  },
  member: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: 30
  }
}));

export const MemberList = ({ party }) => {
  const sorter = (a, b) => (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : a.isMe ? -1 : 1);
  const classes = useStyles();

  const shortenName = name => {
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };

  return (
    <List className={classes.membersList}>
      {party.members.sort(sorter).map((member) => (
        <ListItem key={member.publicKey} className={classes.member}>
          {shortenName(member.displayName || humanize(member.publicKey))}
          <MemberAvatar member={member} />
        </ListItem>
      ))}
    </List>
  );
};

export default MemberList;
