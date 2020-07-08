//
// Copyright 2020 DXOS.org
//

import { EventEmitter } from 'events';

import { randomBytes } from '@dxos/crypto';
import { ObjectModel } from '@dxos/echo-db';
import { createStorage } from '@dxos/random-access-multi-storage';

export class BaseApp extends EventEmitter {
  constructor (opts = {}) {
    super();

    const { storageType } = opts;

    this._storageType = storageType;
    this._identityPublicKey = null;
    this._feedStore = null;
    this._modelFactory = null;
    this._models = new Map();
  }

  get identityPublicKey () {
    return this._identityPublicKey;
  }

  async open () {
    throw new Error('not implemented');
  }

  async createParty () {
    throw new Error('not implemented');
  }

  createInvitation () {
    throw new Error('not implemented');
  }

  async joinParty (invitation) {
    throw new Error('not implemented');
  }

  async createObjectModel (partyPublicKey, options) {
    const id = randomBytes(32).toString('hex');
    let total = 0;
    const model = await this._modelFactory.createModel(ObjectModel, { ...options, topic: partyPublicKey.toString('hex') });
    model.on('update', (_, messages) => {
      total += messages.length;
      this._log('model-update', { messages: messages.length, total });
      this.emit('model-update', { identityPublicKey: this._identityPublicKey, partyPublicKey, modelId: id, messages });
    });
    this._models.set(id, model);
    return { id };
  }

  async createItem (modelId, type, properties) {
    if (!this._models.has(modelId)) {
      throw new Error('model not found');
    }
    const id = this._models.get(modelId).createItem(type, properties);
    return { id };
  }

  async createManyItems (modelId, type, max) {
    if (!this._models.has(modelId)) {
      throw new Error('model not found');
    }
    const model = this._models.get(modelId);

    this._log('createManyItems', { max });
    const path = randomBytes(32).toString('hex');
    for (let i = 0; i < max; i++) {
      model.createItem(type, { value: `val/${path}/${i}` });
    }
  }

  _createStorage () {
    return createStorage(`.temp/${randomBytes(32).toString('hex')}`, this._storageType);
  }

  _log (name, props = {}) {
    const formattedProps = Object.keys(props).map(prop => {
      const value = props[prop];
      return `${prop}=${Buffer.isBuffer(value) ? value.toString('hex').slice(0, 6) : value}`;
    });

    console.log(`${name} client=${this._identityPublicKey.toString('hex').slice(0, 6)} ${formattedProps.join(' ')}`);
  }
}
