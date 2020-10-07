//
// Copyright 2020 DXOS.org
//

import { getConfig } from '@dxos/botkit';

import { GitHubBot } from './bot';

new GitHubBot(getConfig()).start();
