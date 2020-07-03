//
// Copyright 2020 DXOS.org
//

import defaults from 'lodash.defaults';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { ROUTE_KEY_FORMAT, joinPaths, createPath, createRoute, createCanonicalUrl } from '@dxos/react-router';

import { AppKitContext } from './context';

/**
 * Default router configuration.
 */
export const DefaultRouter = {

  paths: {
    home: '/app',
    register: '/register',
    auth: '/auth',
    keys: '/keys',
    members: '/members'
  },

  template: `/:path/:topic(${ROUTE_KEY_FORMAT})?/:item?`,

  routes: {
    app: `/app/:topic(${ROUTE_KEY_FORMAT})?/:item?`,
    register: '/register',
    auth: '/auth',
    keys: `/keys/:topic(${ROUTE_KEY_FORMAT})?`,
    members: `/members/:topic(${ROUTE_KEY_FORMAT})`,
    feed: `/feed/:topic(${ROUTE_KEY_FORMAT})`,
    store: '/store'
  },

  defaults: {
    path: '/app'
  },

  publicUrl: undefined
};

/**
 * The router hook enables the appkit framework to create paths for reusable components.
 * Applications configure the router by injecting the router config into the context.
 */
export const useAppRouter = () => {
  const { router } = useContext(AppKitContext);
  const history = useHistory();

  return {
    paths: router.paths,
    routes: router.routes,

    /**
     * @param parts
     */
    push: (parts) => {
      history.push(createPath(router.template, defaults(parts, router.defaults)));
    },

    /**
     * @param parts
     * @returns {string}
     */
    createPath: (parts) => {
      return createPath(router.template, defaults(parts, router.defaults));
    },

    /**
     * @param parts
     * @returns {string}
     */
    createRoute: (parts) => {
      return createRoute(router.template, parts);
    },

    /**
     * Generate an absolute invitation URL.
     * @returns {function}
     */
    createInvitationUrl: (invitation) => {
      return createCanonicalUrl(
        joinPaths(router.publicUrl, '#', createPath(router.paths.auth, {}, invitation.toQueryParameters()))
      );
    }
  };
};
