//
// Copyright 2020 DXOS.
//

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { truncateString } from '@dxos/debug';
import { useClient } from '@dxos/react-client';

import AppContainer from './AppContainer';
import DefaultSidebar from './DefaultSidebar';

const useStyles = makeStyles(() => ({
  table: {
    tableLayout: 'fixed'
  },

  colOpen: {
    width: 100
  },
  colPath: {
    width: 400
  },
  colMetadata: {
    width: 400
  },

  mono: {
    fontFamily: 'monospace',
    fontSize: 'large'
  }
}));

const FeedStore = () => {
  const classes = useStyles();
  const client = useClient();

  const descriptors = client.feedStore.getDescriptors().map(descriptor => {
    const { feed, path, opened, metadata } = descriptor;

    return (
      <TableRow key={path}>
        <TableCell>
          <Switch disabled checked={opened} />
        </TableCell>
        <TableCell>
          <Typography title={path} className={classes.mono}>
            {truncateString(path, 16)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            title={metadata.topic}
            className={classes.mono}
          >
            {truncateString(metadata.topic, 16)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography>{feed && feed.length}</Typography>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <AppContainer sidebarContent={<DefaultSidebar />}>
      <TableContainer>
        <Table stickyHeader size='small' className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colOpen}>Open</TableCell>
              <TableCell className={classes.colPath}>Path</TableCell>
              <TableCell className={classes.colMetadata}>Topic</TableCell>
              <TableCell className={classes.colBlocks}>Blocks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {descriptors}
          </TableBody>
        </Table>
      </TableContainer>
    </AppContainer>
  );
};

export default FeedStore;
