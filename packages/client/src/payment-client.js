//
// Copyright 2020 DXOS.org
//

import { TransferNames } from '@connext/vector-types';
import { RestServerNodeService, getRandomBytes32 } from '@connext/vector-utils';
import assert from 'assert';
import debug from 'debug';
import { Wallet, utils, providers } from 'ethers';
import pino from 'pino';

import { Registry } from '@wirelineio/registry-client';

const DEFAULT_TIMEOUT = '360000';

const log = debug('client');

export const CHARGE_TYPE_PER_REQUEST = 'per-request';

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
   * Create payment utility.
   * @param {string} coupon
   * @param {string} contractId
   */
  async createPayment (coupon, contractId) {
    let payment;

    if (coupon) {
      payment = decodeBase64ToObj(coupon);
    }

    if (!payment) {
      await this._connect();

      const contract = await this._getContract(contractId);
      const { attributes: { channelAddress, amount } } = contract;

      payment = await this.createTransfer(channelAddress, amount);
      payment.contractId = contractId;
    }

    return payment;
  }

  /**
   * Resolve payment utility.
   * @param {object} payment
   */
  async resolvePayment (payment) {
    assert(payment, 'Invalid payment.');

    const { contractId, transferId, preImage } = payment;

    assert(contractId, 'Invalid contract.');
    assert(transferId, 'Invalid transfer.');
    assert(preImage, 'Invalid preImage.');

    const contract = await this._getContract(contractId);
    log(`Contract: ${JSON.stringify(contract)}`);

    const {
      attributes: {
        channelAddress: contractChannelAddress,
        amount: contractAmount,
        chargeType,

        // TODO(ashwin): Check assetId in contract.
        // assetId,

        // TODO(ashwin): Check that both consumer and provider have signed the contract.
        consumerAddress,
        providerAddress,

        expiryTime
      }
    } = contract;

    assert(contractChannelAddress, 'Invalid channel.');
    assert(contractAmount, 'Invalid amount.');
    assert(chargeType === CHARGE_TYPE_PER_REQUEST, 'Invalid chargeType.');
    assert(consumerAddress, 'Invalid consumerId.');
    assert(providerAddress, 'Invalid providerId.');
    assert(expiryTime, 'Invalid expiryTime.');

    // Check contract hasn't expired.
    if (Date.now() > expiryTime) {
      throw new Error(`Contract ${contractId} has expired.`);
    }

    await this._connect();
    const transfer = await this.getTransfer(transferId);
    const paymentInfo = getPaymentInfo(transfer);

    log(`Validating received payment: ${JSON.stringify(paymentInfo)}`);

    // Check consumer/provider in contract match transfer initiator/resolver.
    if (consumerAddress !== transfer.initiator) {
      throw new Error('Payment consumer/initiator mismatch.');
    }

    if (providerAddress !== transfer.responder) {
      throw new Error('Payment provider/responder mismatch.');
    }

    if (contractChannelAddress !== paymentInfo.channelAddress) {
      throw new Error('Payment channel mismatch (contract/transfer).');
    }

    const paymentAmount = paymentInfo.balances[transfer.initiator];
    if (contractAmount !== paymentAmount) {
      throw new Error(`Payment amount mismatch (contract ${contractAmount} / transfer ${paymentAmount}).`);
    }

    await this.redeemTransfer(contractChannelAddress, transferId, preImage);
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

  /**
   * Get contract from Regstry.
   * @param {string} contractId
   */
  async _getContract (contractId) {
    assert(contractId, 'Invalid contractId.');

    // Load contract from the registry.
    const { server, chainId } = this._config.get('services.wns');

    assert(server, 'Invalid WNS endpoint.');
    assert(chainId, 'Invalid WNS Chain ID.');

    const registry = new Registry(server, chainId);
    const result = await registry.getRecordsByIds([contractId]);

    if (!result.length) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    const [contract] = result;

    return contract;
  }
}
