#!/usr/bin/env node

const { BotFactory, NodeBotContainer, NODE_ENV, getConfig } = require('@dxos/botkit');

const config = getConfig();

new BotFactory(config, { [NODE_ENV]: new NodeBotContainer(config) }).start();
