//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { makeStyles, useTheme } from '@material-ui/styles';
import { AvatarGroup } from '@material-ui/lab';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

import FaceIcon from '@material-ui/icons/Face';
import ShareIcon from '@material-ui/icons/GroupAdd';

import { humanize } from '@dxos/crypto';

import { getAvatarStyle } from './MemberAvatar';
import { useMembers } from '../hooks';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'row'
  }
}));

// TODO(burdon): Pass in array (small UX data object) of processed members (don't apply humanize here).
const PartyMemberList = ({ party, onShare }) => {
  const classes = useStyles();
  const theme = useTheme();
  const members = useMembers(party);

  return (
    <div className={classes.root}>
      <AvatarGroup>
        {members.map(member => (
          <Tooltip key={member.publicKey} title={member.displayName || humanize(member.publicKey)} placement='top'>
            <Avatar style={getAvatarStyle(theme, member.publicKey)}>
              {member.displayName ? member.displayName.slice(0, 1).toUpperCase() : <FaceIcon />}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>

      <Tooltip title='Share' name='share' placement='top'>
        <Avatar style={getAvatarStyle(theme)} onClick={onShare}>
          <ShareIcon />
        </Avatar>
      </Tooltip>
    </div>
  );
};

export default PartyMemberList;
