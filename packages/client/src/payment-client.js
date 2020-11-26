//
// Copyright 2020 DXOS.org
//

import { TransferNames } from '@connext/vector-types';
import { RestServerNodeService, getRandomBytes32 } from '@connext/vector-utils';
import assert from 'assert';
import { Wallet, utils, providers } from 'ethers';
import pino from 'pino';

const DEFAULT_TIMEOUT = '360000';

export const encodeObjToBase64 = (obj) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
};

export const decodeBase64ToObj = (str) => {
  return JSON.parse(Buffer.from(str, 'base64').toString());
};

/**
 * Get payment details for a transfer.
 * @param {object} transfer
 */
export const getPaymentInfo = (transfer) => {
  const { assetId, balance, channelAddress, transferId } = transfer;

  const balances = {};
  balance.to.forEach((address, index) => {
    balances[address] = utils.formatEther(balance.amount[index]);
  });

  return {
    assetId,
    balances,
    channelAddress,
    transferId
  };
};

/**
 * Create payment utility.
 * @param {object} config
 * @param {string} coupon
 * @param {string} channel
 * @param {string} amount
 */
export const createPayment = async (config, coupon, channel, amount) => {
  assert(config, 'Invalid config.');

  let payment;

  if (coupon) {
    payment = decodeBase64ToObj(coupon);
  }

  if (!payment) {
    assert(channel, 'Invalid channel.');
    assert(amount, 'Invalid amount.');

    // Create payment, if not using coupon.
    const paymentClient = new PaymentClient(config);
    await paymentClient.connect();
    payment = await paymentClient.createTransfer(channel, amount);
  }

  return payment;
};

/**
 * Represents client connection to a Vector server node.
 */
export class PaymentClient {
  /**
   * @constructor
   * @param {Object} config
   */
  constructor (config) {
    assert(config);

    this._config = config;
    this._connected = false;
  }

  /**
   * Connect to the server node.
   */
  async connect () {
    await this._connect();

    return { id: this._service.publicIdentifier };
  }

  /**
   * Get basic server node info.
   */
  async getNodeInfo () {
    const { provider } = this._config.get('services.payment');

    assert(provider, 'Invalid payment provider endpoint.');

    await this._connect();

    const rpcProvider = new providers.JsonRpcProvider(provider);
    const balance = await rpcProvider.getBalance(this._service.signerAddress);

    return {
      id: this._service.publicIdentifier,
      address: this._service.signerAddress,
      balance: utils.formatEther(balance)
    };
  }

  /**
   * Get wallet address (uses mnemonic in profile, not server node).
   */
  async getWalletAddress () {
    const { mnemonic, provider } = this._config.get('services.payment');

    assert(mnemonic, 'Invalid account mnemonic.');
    assert(provider, 'Invalid payment provider endpoint.');

    const rpcProvider = new providers.JsonRpcProvider(provider);
    const wallet = Wallet.fromMnemonic(mnemonic).connect(rpcProvider);

    return wallet.address;
  }

  /**
   * Get wallet balance (uses mnemonic in profile, not server node).
   */
  async getWalletBalance () {
    const { mnemonic, provider } = this._config.get('services.payment');

    assert(mnemonic, 'Invalid account mnemonic.');
    assert(provider, 'Invalid payment provider endpoint.');

    const rpcProvider = new providers.JsonRpcProvider(provider);
    const wallet = Wallet.fromMnemonic(mnemonic).connect(rpcProvider);

    const balance = await rpcProvider.getBalance(wallet.address);

    return utils.formatEther(balance);
  }

  /**
   * Sends funds to an address.
   * @param {string} address
   * @param {string} amount
   */
  async sendFunds (address, amount) {
    const { mnemonic, provider } = this._config.get('services.payment');

    assert(mnemonic, 'Invalid account mnemonic.');
    assert(provider, 'Invalid payment provider endpoint.');

    const rpcProvider = new providers.JsonRpcProvider(provider);
    const wallet = Wallet.fromMnemonic(mnemonic).connect(rpcProvider);

    const tx = await wallet.sendTransaction({ to: address, value: utils.parseEther(amount) });
    return tx.wait();
  }

  /**
   * List channels created on the server.
   */
  async listChannels () {
    await this._connect();

    const channelsResult = await this._service.getStateChannels({ publicIdentifier: this._service.publicIdentifier });
    if (channelsResult.isError) {
      throw channelsResult.getError();
    }

    return channelsResult.getValue();
  }

  /**
   * Get channel details.
   * @param {string} channelAddress
   */
  async getChannelInfo (channelAddress) {
    assert(channelAddress, 'Invalid channel.');

    await this._connect();
    const channelResult = await this._service.getStateChannel({ channelAddress, publicIdentifier: this._service.publicIdentifier });
    if (channelResult.isError) {
      throw channelResult.getError();
    }

    const channel = channelResult.getValue();

    return channel;
  }

  /**
   * Setup a payment channel with a counterparty.
   * @param {string} counterpartyIdentifier
   */
  async setupChannel (counterpartyIdentifier) {
    assert(counterpartyIdentifier, 'Invalid counterparty ID.');

    const { chainId, timeout = DEFAULT_TIMEOUT } = this._config.get('services.payment');

    assert(chainId, 'Invalid chain ID.');

    await this._connect();
    const result = await this._service.setup({
      counterpartyIdentifier,
      chainId,
      timeout
    });

    if (result.isError) {
      throw result.getError();
    }

    const { channelAddress } = result.getValue();

    return { channelAddress };
  }

  /**
   * Get balances for either party in a payment channel.
   * @param {string} channelAddress
   */
  async getChannelBalances (channelAddress) {
    assert(channelAddress, 'Invalid channel.');

    await this._connect();
    const channelResult = await this._service.getStateChannel({ channelAddress, publicIdentifier: this._service.publicIdentifier });
    if (channelResult.isError) {
      throw channelResult.getError();
    }

    const channel = channelResult.getValue();

    const { assetId } = this._config.get('services.payment');

    assert(assetId, 'Invalid asset ID.');

    const assetIdx = channel.assetIds.findIndex(id => id === assetId);

    const assetBalances = channel.balances[assetIdx] || { to: [], amount: [] };

    const balances = {};
    assetBalances.to.forEach((address, index) => {
      balances[address] = utils.formatEther(assetBalances.amount[index]);
    });

    return balances;
  }

  /**
   * Add funds to a payment channel.
   * @param {string} channelAddress
   * @param {string} amount
   */
  async addFunds (channelAddress, amount) {
    assert(channelAddress, 'Invalid channel.');
    assert(amount, 'Invalid amount.');

    const { assetId, provider } = this._config.get('services.payment');

    assert(assetId, 'Invalid asset ID.');
    assert(provider, 'Invalid payment provider endpoint.');

    await this._connect();
    const channelResult = await this._service.getStateChannel({ channelAddress, publicIdentifier: this._service.publicIdentifier });
    if (channelResult.isError) {
      throw channelResult.getError();
    }

    const channel = channelResult.getValue();
    const result = await this._service.sendDepositTx({
      chainId: channel.networkContext.chainId,
      amount: utils.parseEther(amount).toString(),
      assetId,
      channelAddress: channel.channelAddress,
      publicIdentifier: this._service.publicIdentifier
    });

    if (result.isError) {
      throw result.getError();
    }

    const rpcProvider = new providers.JsonRpcProvider(provider);
    await rpcProvider.waitForTransaction(result.getValue().txHash);
  }

  /**
   * Reconcile on-chain deposit with payment channel balance.
   * @param {string} channelAddress
   */
  async reconcileDeposit (channelAddress) {
    assert(channelAddress, 'Invalid channel.');

    const { assetId, provider } = this._config.get('services.payment');

    assert(assetId, 'Invalid asset ID.');
    assert(provider, 'Invalid payment provider endpoint.');

    await this._connect();
    const channelResult = await this._service.getStateChannel({ channelAddress, publicIdentifier: this._service.publicIdentifier });
    if (channelResult.isError) {
      throw channelResult.getError();
    }

    const channel = channelResult.getValue();
    const result = await this._service.reconcileDeposit({
      assetId,
      channelAddress: channel.channelAddress,
      publicIdentifier: this._service.publicIdentifier
    });

    if (result.isError) {
      throw result.getError();
    }
  }

  /**
   * Create a transfer to the counterparty (micropayment).
   * @param {string} channelAddress
   * @param {string} amount
   */
  async createTransfer (channelAddress, amount) {
    assert(channelAddress, 'Invalid channel.');
    assert(amount, 'Invalid amount.');

    await this._connect();

    const { assetId } = this._config.get('services.payment');

    assert(assetId, 'Invalid asset ID.');

    const transferAmt = utils.parseEther(amount);
    const preImage = getRandomBytes32();
    const lockHash = utils.soliditySha256(['bytes32'], [preImage]);
    const result = await this._service.conditionalTransfer({
      amount: transferAmt.toString(),
      assetId,
      channelAddress,
      type: TransferNames.HashlockTransfer,
      details: {
        lockHash,
        expiry: '0'
      },
      publicIdentifier: this._service.publicIdentifier
    });

    if (result.isError) {
      throw result.getError();
    }

    const { transferId } = result.getValue();

    return {
      channelAddress,
      transferId,
      preImage
    };
  }

  /**
   * Get transfer details.
   * @param {string} transferId
   */
  async getTransfer (transferId) {
    assert(transferId, 'Invalid transferId.');

    await this._connect();

    const result = await this._service.getTransfer({ transferId, publicIdentifier: this._service.publicIdentifier });
    if (result.isError) {
      throw result.getError();
    }

    const transfer = result.getValue();

    return transfer;
  }

  /**
   * Redeem a transfer (micropayment) created by the counterparty.
   * @param {string} channelAddress
   * @param {string} transferId
   * @param {string} preImage
   */
  async redeemTransfer (channelAddress, transferId, preImage) {
    assert(channelAddress, 'Invalid channel.');
    assert(transferId, 'Invalid transferId.');
    assert(preImage, 'Invalid preImage.');

    await this._connect();
    const result = await this._service.resolveTransfer({
      publicIdentifier: this._service.publicIdentifier,
      channelAddress,
      transferResolver: {
        preImage
      },
      transferId
    });

    if (result.isError) {
      throw result.getError();
    }
  }

  /**
   * Withdraw funds from the channel (to on-chain address).
   * @param {string} channelAddress
   * @param {string} amount
   */
  async withdrawFunds (channelAddress, amount) {
    assert(channelAddress, 'Invalid channel.');
    assert(amount, 'Invalid amount.');

    const { assetId } = this._config.get('services.payment');

    assert(assetId, 'Invalid asset ID.');

    await this._connect();
    const result = await this._service.withdraw({
      publicIdentifier: this._service.publicIdentifier,
      channelAddress,
      amount: utils.parseEther(amount).toString(),
      assetId,
      recipient: this._service.signerAddress
    });

    if (result.isError) {
      throw result.getError();
    }
  }

  /**
   * Connect and cache server node handle.
   */
  async _connect () {
    if (!this._connected) {
      const { server } = this._config.get('services.payment');
      assert(server, 'Invalid payment server endpoint.');

      this._service = await RestServerNodeService.connect(server, pino(), undefined, 0);
      this._connected = true;
    }
  }
}
