//
// Copyright 2020 DXOS.org
//

import { useParams } from 'react-router-dom';

import { useConfig } from '@dxos/react-client';
import { reload } from '@dxos/react-router';

import { useAppRouter } from './router';

export const Action = {
  RELOAD: 0,
  HOME: 1,
  SHOW_FEED_STORE: 2,
  SHOW_FEED_VIEW: 3,
  SHOW_KEYRING: 4,
  SELECT_PARTY: 5,
  SHOW_MEMBERS: 6
};

/**
 * Handle AppKit action.
 */
export const useActionHandler = () => {
  const config = useConfig();
  const router = useAppRouter();
  const { path } = useParams();

  return (action, props) => {
    switch (action) {
      case Action.RELOAD: {
        reload(config.app.publicUrl);
        break;
      }

      case Action.HOME: {
        router.push({ path: router.paths.home });
        break;
      }

      case Action.SHOW_FEED_STORE: {
        router.push({ path: router.paths.store });
        break;
      }

      case Action.SHOW_FEED_VIEW: {
        const { topic } = props;
        router.push({ path: router.paths.feed, topic });
        break;
      }

      case Action.SHOW_KEYRING: {
        const { topic } = props;
        router.push({ path: router.paths.keys, topic });
        break;
      }

      case Action.SHOW_MEMBERS: {
        const { topic } = props;
        router.push({ path: router.paths.members, topic });
        break;
      }

      case Action.SELECT_PARTY: {
        const { topic, item } = props;
        router.push({ path, topic, item });
        break;
      }

      default:
        console.warn(`Unknown action: ${action}`);
    }
  };
};
