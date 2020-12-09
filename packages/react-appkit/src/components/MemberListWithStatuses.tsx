//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { makeStyles, Typography } from '@material-ui/core';

import { MemberList } from './index';

const useStyles = makeStyles(() => ({
  onlineSummary: {
    textAlign: 'center'
  }
}));

type MemberListWithStatusesPropsType = { party: { presence: { peers: }} }

// This will be used for party activity indicators
// ISSUE: https://github.com/dxos/teamwork/issues/424
export const MemberListWithStatuses = ({ party }: MemberListWithStatusesPropsType) => {
  const [online, setOnline] = useState((party.presence.peers ?? []).length);
  const classes = useStyles();

  useEffect(() => {
    const graphUpdatedHandler = () => {
      setOnline((party.presence.peers ?? []).length);
    };

    party.presence.on('graph-updated', graphUpdatedHandler);
    return () => party.presence.off('graph-updated', graphUpdatedHandler);
  }, []);

  return (
    <MemberList party={party}>
      <Typography className={classes.onlineSummary}>{online} online</Typography>
    </MemberList>
  );
};

export default MemberListWithStatuses;
