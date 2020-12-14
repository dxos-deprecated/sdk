//
// Copyright 2020 DXOS.org
//

import React, { ReactNode } from 'react';

import { List, ListItem, makeStyles } from '@material-ui/core';

import { Party } from '@dxos/credentials';
import { PartyMember } from '@dxos/echo-db';

import { MemberAvatar } from '.';
import { useMembers } from '../hooks';

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

type Member = PartyMember & { isMe: boolean }

export const MemberList = ({ party, children }: { party: Party, children?: ReactNode }) => {
  const sorter = (a: Member, b: Member) => {
    if (!a.displayName || !b.displayName) {
      return 0;
    }
    return a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : a.isMe ? -1 : 1;
  };
  const classes = useStyles();
  const members = useMembers(party);

  const shortenName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };

  return (
    <List className={classes.membersList}>
      {children}
      {members.sort(sorter).map((member: Member) => (
        <ListItem key={member.publicKey.toString()} className={classes.member}>
          <MemberAvatar member={member} />
          &nbsp;
          {shortenName(member.displayName || 'Loading...')}
        </ListItem>
      ))}
    </List>
  );
};

export default MemberList;
