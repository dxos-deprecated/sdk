//
// Copyright 2020 DXOS.org
//

import { EventEmitter } from 'events';

import { randomBytes } from '@dxos/crypto';
import { ObjectModel } from '@dxos/echo-db';
import { createStorage } from '@dxos/random-access-multi-storage';

const kModelDescriptor = Symbol('modelDescriptor');

class ModelDescriptor {
  constructor (model) {
    this._model = model;

    this._id = randomBytes(32).toString('hex');
    this._state = {
      appended: 0,
      updated: 0
    };

    model.on('preappend', () => {
      this._state.appended++;
    });
    model.on('update', (model, messages) => {
      this._state.updated += messages.length;
    });
  }

  get id () {
    return this._id;
  }

  get objects () {
    return Array.from(this.model._model._objectById.values());
  }

  get state () {
    return {
      ...this._state,
      objectsCount: this.objects.lenght
    };
  }

  get destroyed () {
    return this._model.destroyed;
  }

  get model () {
    return this._model;
  }
}

export const getModelDescriptor = (model) => model[kModelDescriptor];

export class BaseAgent extends EventEmitter {
  constructor (opts = {}) {
    super();

    const { storageType } = opts;

    this._storageType = storageType;
    this._identityPublicKey = null;
    this._feedStore = null;
    this._modelFactory = null;
    this._modelDescriptors = new Map();
    this._errors = [];
  }

  get models () {
    return Array.from(this._modelDescriptors.values()).map(descriptor => descriptor.model);
  }

  get modelDescriptors () {
    return Array.from(this._modelDescriptors.values());
  }

  get state () {
    const totalState = { appended: 0, updated: 0, errors: this._errors };
    const modelState = {};
    for (const descriptor of this.modelDescriptors) {
      totalState.appended += descriptor.state.appended;
      totalState.updated += descriptor.state.updated;
      modelState[descriptor.id] = descriptor.state;
    }

    return {
      total: totalState,
      models: modelState
    };
  }

  get identityPublicKey () {
    return this._identityPublicKey;
  }

  async init () {
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

  async tick () {
    throw new Error('not implemented');
  }

  async createModel (partyPublicKey, { ModelClass = ObjectModel, options }) {
    const model = await this._modelFactory.createModel(ModelClass, { ...options, topic: partyPublicKey.toString('hex') });
    const descriptor = new ModelDescriptor(model);
    model.on('update', (_, messages) => {
      this._log('model-update', { messages: messages.length, state: descriptor.state });
      this.emit('model-update', { identityPublicKey: this._identityPublicKey, partyPublicKey, modelId: descriptor.id, messages });
    });
    this._modelDescriptors.set(descriptor.id, descriptor);
    model[kModelDescriptor] = descriptor;
    return model;
  }

  _createStorage (storageType) {
    return createStorage(`.temp/${randomBytes(32).toString('hex')}`, storageType || this._storageType);
  }

  _onPartyUpdate (partyInfo) {
    const members = partyInfo.members.map(m => ({
      publicKey: m.publicKey,
      displayName: m.displayName
    }));

    this.emit('party-update', { publicKey: partyInfo.publicKey, members });
  }

  _log (name, props = {}) {
    if (props.err) {
      this._errors.push(props.err);
    }

    const formattedProps = Object.keys(props).map(prop => {
      const value = props[prop];
      return `${prop}=${Buffer.isBuffer(value) ? value.toString('hex').slice(0, 6) : JSON.stringify(value)}`;
    });

    console.log(`${name} client=${this._identityPublicKey.toString('hex').slice(0, 6)} ${formattedProps.join(' ')}`);
  }
}
