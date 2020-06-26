//
// Copyright 2020 DXOS.
//

import { AssertionError } from 'assert';

import { ROUTE_KEY_FORMAT, createCanonicalUrl, createPath, createRoute, createUrl, joinPaths } from './router';

test('joinPaths', () => {
  const url = joinPaths(undefined, 'a', '//b', '', 'c');
  expect(url).toEqual('a/b/c');
});

test('createCanonicalUrl', () => {
  const url = createCanonicalUrl('/foo');
  expect(url).toEqual('http://localhost/foo');
});

test('createUrl', () => {
  const query = { a: 100, b: true, c: undefined };
  const url = createUrl('/test', query);
  expect(url).toEqual('/test?a=100&b=true');
});

test('createPath', () => {
  const url = createPath('/auth', {}, { username: 'test' });
  expect(url).toEqual('/auth?username=test');
});

test('createPath with typed params', () => {
  const url = createPath(`/:topic(${ROUTE_KEY_FORMAT})`, { topic: 'xxx' });
  expect(url).toEqual('/xxx');
});

test('createPath with optional params', () => {
  expect(() => createPath('/:topic/:item', { topic: '123' })).toThrow(AssertionError);

  {
    const url = createPath('/:topic?', { topic: undefined });
    expect(url).toEqual('/');
  }

  {
    const url = createPath('/:topic?/:item?');
    expect(url).toEqual('/');
  }
  {
    const url = createPath(`/:topic(${ROUTE_KEY_FORMAT})?`);
    expect(url).toEqual('/');
  }

  {
    const url = createPath(`/:topic(${ROUTE_KEY_FORMAT})?/:item?`);
    expect(url).toEqual('/');
  }

  {
    const url = createPath('/:topic/:item?', { topic: '123' });
    expect(url).toEqual('/123');
  }

  {
    const url = createPath('/:topic/editor/:item?', { topic: '123', item: 'xyz' });
    expect(url).toEqual('/123/editor/xyz');
  }
});

test('createRoute', () => {
  const url = createRoute('/:topic/:path?/:item?', { path: 'editor' });
  expect(url).toEqual('/:topic/editor/:item?');
});
