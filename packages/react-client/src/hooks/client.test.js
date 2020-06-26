//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

// import { renderHook, act as xxx } from '@testing-library/react-hooks'

import ClientContextProvider from '../containers/ClientContextProvider';

// import { useClient } from './client';

jest.setTimeout(10000);

const config = {
  client: {
    storage: {
      type: 'ram',
      root: './test'
    }
  }
};

const Test = () => {
  // const client = useClient();

  // TODO(burdon): Should not return null.
  // expect(client).toBeTruthy();
  // expect(client.config).toEqual(config);

  return (
    <div>Test</div>
  );
};

const Root = ({ config: { client: clientConfig } }) => {
  return (
    <ClientContextProvider config={clientConfig}>
      <Test />
    </ClientContextProvider>
  );
};

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

test('Root component', () => {
  // https://reactjs.org/docs/test-utils.html#act
  act(() => {
    ReactDOM.render(<Root config={config} />, container);
  });
});
