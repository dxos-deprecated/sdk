//
// Copyright 2020 DXOS.org
//

import assert from 'assert';

/**
 * Parse part of a route expression.
 * See: https://github.com/pillarjs/path-to-regexp/tree/v1.7.0
 * E.g., matches: "/:topic([0-9a-fA-F]{64})?
 * @type {RegExp}
 */
export const ROUTE_PART_REGEX = /:([^?(]+)(\(.+\))?(\?)?/;

/**
 * Path matches hex keys.
 * See: https://github.com/pillarjs/path-to-regexp/tree/v1.7.0
 * @type {string}
 */
export const ROUTE_KEY_FORMAT = '[0-9a-fA-F]{64}';

/**
 * Reloads the app.
 */
export const reload = (path = '/') => {
  window.location.replace(path);
};

/**
 * Safely joins the paths to create a valid URL.
 */
// eslint-disable-next-line prefer-template
export const joinPaths = (...parts: (string | undefined)[]): string => (
  parts.filter(Boolean).map(part => (part || '').replace(/^\/+/, '')).join('/')
);

/**
 * Creates a canoncial URL (permalink).
 */
export const createCanonicalUrl = (path = ''): string => joinPaths(window.location.origin, path);

/**
 * Creates a URL with well formed query params.
 */
export const createUrl = (path: string, query: Record<string, any> = {}): string => {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }

  const args = Object.entries(query).map(([key, value]) => {
    return (value !== undefined) && `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }).filter(Boolean);

  return `${path}?${args.join('&')}`;
};

/**
 * Creates a URL matching the given template.
 * @param {string} [path] - Router path template.
 * @param {Object} [params]
 * @param {Object} [query]
 * @param {Object} [options]
 * @returns {string}
 */
export const createPath = (
  path = '',
  params?: Record<string, any>,
  query?: Record<string, any>,
  options: Record<string, any> = { partial: false }
): string => {
  if (!params) {
    params = {};
  }

  // Parse the route path and match against the supplied params.
  const parts = path.split('/').filter(Boolean).map(part => {
    const match = part.match(ROUTE_PART_REGEX);
    if (!match) {
      return part;
    }

    const [, key,, optional = false] = match;

    assert(params);
    const value = params[key];
    if (value === undefined) {
      if (options.partial) {
        return part;
      }

      assert(optional, `Expected property: ${key}`);
    }

    // Strip leading slash.
    return value ? value.replace(/^\//, '') : undefined;
  });

  return createUrl(`/${joinPaths(...parts)}`, query || undefined);
};

/**
 * Creates a `<Route />` path populating path variables with given params.
 * @param {string} path
 * @param {Object} params
 * @returns {string}
 */
export const createRoute = (path = '', params: Record<string, any>): string => {
  return createPath(path, params, undefined, { partial: true });
};
