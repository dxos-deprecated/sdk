//
// Copyright 2020 DXOS.
//

import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';

import { createClient } from '@dxos/client';
import { createStorage, STORAGE_RAM } from '@dxos/random-access-multi-storage';
import { Keyring, KeyType } from '@dxos/credentials';
import { ObjectModel } from '@dxos/echo-db';

export class TestApp extends EventEmitter {
  constructor (opts = {}) {
    super();

    const { storageType = STORAGE_RAM } = opts;

    this._storageType = storageType;
    this._secret = '0000';
    this._client = null;
    this._models = new Map();

    this._greeterSecretProvider = () => Buffer.from(this._secret);
    this._greeterSecretValidator = (invitation, secret) => secret && secret.equals(invitation.secret);
    this._inviteeSecretProvider = () => Buffer.from(this._secret);
  }

  get identityPublicKey () {
    return this._client.partyManager.identityManager.deviceManager.publicKey;
  }

  async open () {
    const keyring = new Keyring();
    await keyring.createKeyRecord({ type: KeyType.IDENTITY });
    this._client = await createClient(createStorage(`.temp/${randomBytes(32).toString('hex')}`, this._storageType), keyring);
    await this._client.partyManager.identityManager.initializeForNewIdentity();
  }

  async createParty () {
    const party = await this._client.partyManager.createParty();
    const partyInfo = this._client.partyManager.getPartyInfo(party.publicKey);
    partyInfo.on('update', () => {
      this.emit('party-update', partyInfo);
    });
    return { publicKey: party.publicKey };
  }

  createInvitation (partyPublicKey) {
    return this._client.partyManager.inviteToParty(partyPublicKey, this._greeterSecretProvider, this._greeterSecretValidator);
  }

  async joinParty (invitation) {
    const party = await this._client.partyManager.joinParty(invitation, this._inviteeSecretProvider);
    const partyInfo = this._client.partyManager.getPartyInfo(party.publicKey);
    partyInfo.on('update', () => {
      this.emit('party-update', partyInfo);
    });
  }

  async createObjectModel (partyPublicKey, options) {
    const id = randomBytes(32).toString('hex');
    const model = await this._client.modelFactory.createModel(ObjectModel, { ...options, topic: partyPublicKey.toString('hex') });
    this._models.set(id, model);
    model.on('update', (_, messages) => {
      this.emit('model-update', { clientPublicKey: this.clientPublicKey, partyPublicKey, modelId: id, messages });
    });
    return { id };
  }

  async createItem (modelId, type, properties) {
    if (!this._models.has(modelId)) {
      throw new Error('model not found');
    }
    const id = this._models.get(modelId).createItem(type, properties);
    return { id };
  }
}
