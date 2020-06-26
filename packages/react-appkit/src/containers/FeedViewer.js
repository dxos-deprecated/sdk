//
// Copyright 2020 DXOS.
//

import React from 'react';
import { useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import { useModel } from '@dxos/react-client';

import { useFilterReducer } from '../hooks';

import Feed from '../components/Feed';
import MessageFilter from '../components/MessageFilter';
import AppContainer from './AppContainer';
import DefaultSidebar from './DefaultSidebar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },

  filter: {
    display: 'flex',
    flexShrink: 0,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(2)
  },

  feed: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  }
}));

const FeedViewer = () => {
  const { topic } = useParams();
  const [{ type }, setFilter] = useFilterReducer();
  const classes = useStyles();

  const model = useModel({
    options: {
      readStreamOptions: { feedLevelIndexInfo: true },
      topic,
      type
    }
  });
  const messages = model ? [...model.messages].reverse() : [];
  const types = model ? [...new Set(model.messages.map(({ data: { __type_url: type } }) => type))] : [];

  return (
    <AppContainer sidebarContent={<DefaultSidebar />}>
      <div className={classes.root}>
        <div className={classes.filter}>
          <MessageFilter types={types} onChange={type => setFilter({ type })} />
        </div>

        <div className={classes.feed}>
          <Feed messages={messages} onSelect={(message, type) => setFilter({ type })} />
        </div>
      </div>
    </AppContainer>
  );
};

export default FeedViewer;
