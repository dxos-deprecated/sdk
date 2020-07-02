//
// Copyright 2020 DXOS.
//

import assert from 'assert';

import { Codec } from '@dxos/codec-protobuf';

export const COMMAND_SIGN = 'dxos.ipc.bot.SignChallenge';
export const SIGN_RESPONSE = 'dxos.ipc.bot.SignChallengeResponse';
export const COMMAND_INVITE = 'dxos.ipc.bot.InvitationMessage';

export const MESSAGE_CONFIRM = 'dxos.ipc.bot.ConfirmConnection';

/**
 * Bot IPC codec.
 */
export const codec = new Codec('dxos.ipc.bot.Message')
  // eslint-disable-next-line global-require
  .addJson(require('./schema.json'))
  .build();

/**
 * Creates a new Sign command message.
 * @param {Buffer} message
 */
export const createSignCommand = (message) => {
  assert(message);
  assert(Buffer.isBuffer(message));

  return {
    message: {
      __type_url: COMMAND_SIGN,
      message
    }
  };
};

/**
 * Creates a response for Sign command message.
 * @param {Buffer} signature
 */
export const createSignResponse = (signature) => {
  assert(signature);
  assert(Buffer.isBuffer(signature));

  return {
    message: {
      __type_url: SIGN_RESPONSE,
      signature
    }
  };
};

/**
 * Creates a new connection confirmation message.
 * @param {string} id
 */
export const createConnectConfirmMessage = (id) => {
  assert(id);

  return {
    message: {
      __type_url: MESSAGE_CONFIRM,
      id
    }
  };
};

/**
 * Creates a new invitation message.
 * @param {string} topic
 * @param {Object} invitation
 */
export const createInvitationMessage = (topic, invitation) => {
  assert(topic);
  assert(invitation);

  return {
    message: {
      __type_url: COMMAND_INVITE,
      topic,
      invitation
    }
  };
};
