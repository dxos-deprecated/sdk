//
// Copyright 2020 DXOS.org
//

import { renderHook } from '@testing-library/react-hooks';

import { useConfig } from '../src';

describe('Config hook', () => {
  const render = () => useConfig();

  it('should throw when used outside a context', () => {
    const { result } = renderHook(render);
    expect(result.error?.message).toEqual('`useConfig` hook is called outside of ClientContext. Wrap the component with `ClientProvider` or `ClientInitializer`');
  });
});
