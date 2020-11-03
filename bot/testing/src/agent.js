//
// Copyright 2020 DXOS.org
//

export class Agent {
  constructor (botFactoryClient, botId) {
    this._botId = botId;
    this._botFactoryClient = botFactoryClient;
  }

  async sendCommand (data) {
    const message = Buffer.from(JSON.stringify(data));
    const { message: { data: result, error } } = await this._botFactoryClient.sendBotCommand(this._botId, message);
    if (error) {
      throw new Error(error);
    }

    return result.toString();
  }
}
