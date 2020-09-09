//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { makeStyles, Typography } from '@material-ui/core';

import { MemberList } from '../components';

const useStyles = makeStyles(() => ({
  onlineSummary: {
    textAlign: 'center'
  }
}));

export const MemberListWithStatuses = ({ party }) => {
  const [online, setOnline] = useState(0);
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
