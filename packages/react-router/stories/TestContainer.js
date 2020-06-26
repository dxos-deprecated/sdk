//
// Copyright 2020 Wireline, Inc.
//

import React from 'react';
import { Route, useHistory, useLocation, useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';

import { CheckRoute, createPath, createUrl, useQuery } from '../src';

const useStyles = makeStyles(theme => ({
  toolbar: {
    backgroundColor: grey[100]
  },

  info: {
    fontFamily: 'monospace',
    fontSize: 'large',
    padding: theme.spacing(1)
  }
}));

const PATH_HOME = '/';
const PATH_ITEM = '/:topic/:type/:item?';
const PATH_AUTH = '/auth';

const TestComponent = () => {
  const classes = useStyles();
  const location = useLocation();
  const params = useParams();
  const query = useQuery();

  return (
    <div className={classes.info}>
      <div>Location: {JSON.stringify(location)}</div>
      <div>Params: {JSON.stringify(params)}</div>
      <div>Query: {JSON.stringify(query)}</div>
    </div>
  );
};

const TestAuth = () => {
  const history = useHistory();
  const { redirectUrl } = useQuery();
  const url = createUrl(redirectUrl, { auth: true });

  return (
    <>
      <TestComponent />

      {redirectUrl && (
        <div>
          <Button onClick={() => history.push(url)}>Auth</Button>
        </div>
      )}
    </>
  );
};

const TestModule = () => {
  const classes = useStyles();
  const { topic } = useParams();

  const rules = [
    ({ query: { auth }, path }) => {
      return (auth === undefined) && createPath(PATH_AUTH, {}, { redirectUrl: path });
    }
  ];

  return (
    <>
      <div className={classes.info}>Topic: {topic}</div>

      <CheckRoute preconditions={rules}>
        <Route exact path={PATH_ITEM} component={TestComponent} />
      </CheckRoute>
    </>
  );
};

const TestContainer = () => {
  const classes = useStyles();
  const history = useHistory();

  const nav = [
    {
      path: createPath(PATH_HOME),
      title: 'Home'
    },
    {
      path: createPath(PATH_AUTH, {}, { invitation: 'xxx', channel: 'yyy' }),
      title: 'Auth'
    },
    {
      path: createPath(PATH_ITEM, { topic: 'topic-x', type: 'document', item: 'item-1' }),
      title: 'Item 1'
    },
    {
      path: createPath(PATH_ITEM, { topic: 'topic-y', type: 'game', item: 'item-2' }),
      title: 'Item 2'
    },
    {
      path: createPath(PATH_ITEM, { topic: 'topic-z', type: 'game', item: 'item-3' }),
      title: 'Item 3'
    }
  ];

  return (
    <div>
      <Toolbar className={classes.toolbar}>
        {nav.map(({ path, title }) => (
          <Button key={path} onClick={() => history.push(path)}>{title}</Button>
        ))}
      </Toolbar>

      <div>
        <Route exact path={PATH_HOME} component={TestComponent} />
        <Route exact path={PATH_AUTH} component={TestAuth} />
        <Route exact path={PATH_ITEM} component={TestModule} />
      </div>
    </div>
  );
};

export default TestContainer;
