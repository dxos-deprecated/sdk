import { EventEmitter } from 'events';
import { createClient } from '@dxos/client';
import { Keyring, KeyType } from '@dxos/credentials';
import { InviteDetails, InviteType } from '@dxos/party-manager';
import { ObjectModel } from '@dxos/echo-db';
import { createStorage } from '@dxos/random-access-multi-storage';
import { randomBytes } from '@dxos/crypto';

export class BaseAgent extends EventEmitter {
  constructor () {
    super();

    this._secret = '0000';
    this._client = null;

    this._greeterSecretProvider = () => Buffer.from(this._secret);
    this._greeterSecretValidator = (invitation, secret) => secret && secret.equals(invitation.secret);
    this._inviteeSecretProvider = () => Buffer.from(this._secret);
  }

  get identityPublicKey () {
    return this._identityPublicKey;
  }

  async init (opts = {}) {
    const keyring = new Keyring();
    await keyring.createKeyRecord({ type: KeyType.IDENTITY });
    const storage = createStorage(`.temp/${randomBytes(32).toString('hex')}`, opts.storage);
    this._client = await createClient(storage, keyring);
    await this._client.partyManager.identityManager.initializeForNewIdentity();
    this._identityPublicKey = this._client.partyManager.identityManager.deviceManager.publicKey;
    this._feedStore = this._client.feedStore;
    this._modelFactory = this._client.modelFactory;
  }

  _log (name, props = {}) {
    const formattedProps = Object.keys(props).map(prop => {
      const value = props[prop];
      return `${prop}=${Buffer.isBuffer(value) ? value.toString('hex').slice(0, 6) : value}`;
    });

    console.log(`${name} client=${this._identityPublicKey.toString('hex').slice(0, 6)} ${formattedProps.join(' ')}`);
  }

  async createParty () {
    const party = await this._client.partyManager.createParty();
    const partyInfo = this._client.partyManager.getPartyInfo(party.publicKey);
    partyInfo.on('update', () => this._onPartyUpdate(partyInfo));
    return { publicKey: party.publicKey };
  }

  createInvitation (partyPublicKey) {
    return this._client.partyManager.inviteToParty(partyPublicKey, new InviteDetails(InviteType.INTERACTIVE, {
      secretValidator: this._greeterSecretValidator,
      secretProvider: this._greeterSecretProvider,
    }));
  }

  async joinParty (invitation) {
    const party = await this._client.partyManager.joinParty(invitation, this._inviteeSecretProvider);
    const partyInfo = this._client.partyManager.getPartyInfo(party.publicKey);
    partyInfo.on('update', () => this._onPartyUpdate(partyInfo));
  }

  _onPartyUpdate (partyInfo) {
    const members = partyInfo.members.map(m => ({
      publicKey: m.publicKey,
      displayName: m.displayName
    }));

    this.emit('party-update', { publicKey: partyInfo.publicKey, members });
  }

  async createObjectModel (partyPublicKey, options) {
    let total = 0;
    const model = await this._modelFactory.createModel(ObjectModel, { ...options, topic: partyPublicKey.toString('hex') });
    model.on('update', (_, messages) => {
      total += messages.length;
      this._log('model-update', { messages: messages.length, total, objectCount: [...model._model._objectById.values()].length });
      this.emit('model-update', { identityPublicKey: this._identityPublicKey, partyPublicKey, messageCount: total, objectCount: [...model._model._objectById.values()].length });
    });
    this._model = model;
    return model;
  }

  dumpState () {
    return [...this._model._model._objectById.values()];
  }
}
