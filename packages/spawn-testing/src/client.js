//
// Copyright 2020 DXOS.
//

const { randomBytes } = require('crypto');
const { EventEmitter } = require('events');

const { createClient } = require('@dxos/client');
const { createStorage, STORAGE_RAM } = require('@dxos/random-access-multi-storage');
const { Keyring, KeyType } = require('@dxos/credentials');

module.exports = class Client extends EventEmitter {
  constructor (opts = {}) {
    super();

    const { storageType = STORAGE_RAM } = opts;

    this._storageType = storageType;
    this._secret = '0000';
    this._client = null;

    this._greeterSecretProvider = () => Buffer.from(this._secret);
    this._greeterSecretValidator = (invitation, secret) => secret && secret.equals(invitation.secret);
    this._inviteeSecretProvider = () => Buffer.from(this._secret);
  }

  get publicKey () {
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

  createInvitation (publicKey) {
    return this._client.partyManager.inviteToParty(publicKey, this._greeterSecretProvider, this._greeterSecretValidator);
  }

  async joinParty (invitation) {
    const party = await this._client.partyManager.joinParty(invitation, this._inviteeSecretProvider);
    const partyInfo = this._client.partyManager.getPartyInfo(party.publicKey);
    partyInfo.on('update', () => {
      this.emit('party-update', partyInfo);
    });
  }
};
