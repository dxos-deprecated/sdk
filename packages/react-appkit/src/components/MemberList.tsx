//
// Copyright 2020 DXOS.org
//

import React, { ReactChildren } from 'react';

import { List, ListItem, makeStyles } from '@material-ui/core';

import { MemberAvatar } from '.';
import { useMembers } from '../hooks';
import { Party } from '@dxos/credentials';
import { PartyMember } from '@dxos/echo-db';

import assert from 'assert';

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

type MemberListPropsType = { party: Party, children: ReactChildren }
type Member = PartyMember & { isMe: boolean }

export const MemberList = ({ party, children }: MemberListPropsType) => {
  const sorter = (a: Member, b: Member) => {
    assert(a.displayName);
    assert(b.displayName);
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
