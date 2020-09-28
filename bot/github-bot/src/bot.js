//
// Copyright 2020 DXOS.org
//

import fs from 'fs-extra';
import path from 'path';
import Queue from 'fastq';

import { Bot } from '@dxos/botkit';
import { docToMarkdown /*, markdownToDoc */ } from '@dxos/editor-core';
import { TextModel, TYPE_TEXT_MODEL_UPDATE } from '@dxos/text-model';

import { cloneRepo, commitAndPush } from './git';

const TYPE_EDITOR_DOCUMENT = 'wrn_dxos_org_teamwork_editor_document';
const REPO_PATH = './repos';

const GIT_UPDATE_TIMEOUT = 7000;
const MAX_UNCOMMITED_TIME = 60000;

const WORKERS_NUM = 1;

/**
 * GitHub bot.
 */
export class GitHubBot extends Bot {
  /**
   * @type {Map<String, {documentId: String, displayName: String, party: String, model: Model}>}
   */
  _docs = new Map();

  _botParties = new Map();

  constructor (config) {
    super(config);

    this.on('party', async (topic) => {
      await this.joinParty(topic);
    });

    this._queue = Queue(this, this._docUpdateHandler, WORKERS_NUM);
  }

  async botCommandHandler (message) {
    const command = JSON.parse(message.toString()) || {};
    let result = {};
    switch (command.type) {
      case 'list': {
        result = [...this._botParties.values()];
        break;
      }
      case 'assign': {
        const { topic, repo, username, token } = command;
        let success = false;
        if (topic && this._botParties.has(topic) && repo) {
          await this._assignRepo(topic, repo, username, token);
          success = true;
        }
        result = { success };
        break;
      }
      default:
        break;
    }

    return Buffer.from(JSON.stringify(result));
  }

  /**
   * Join party.
   * @param {String} topic
   */
  async joinParty (topic) {
    console.log(`Joining party '${topic}'.`);
    this._botParties.set(topic, { topic });

    const model = await this._client.modelFactory.createModel(undefined, { type: [TYPE_EDITOR_DOCUMENT], topic });

    model.on('update', async () => {
      if (model.messages) {
        for (const message of model.messages) {
          const { itemId, displayName } = message;
          if (!this._docs.has(itemId)) {
            console.log(`Opening doc '${itemId}'.`);
            const docModel = await this._client.modelFactory.createModel(TextModel, { type: [TYPE_TEXT_MODEL_UPDATE], topic, documentId: itemId });
            this._docs.set(itemId, { documentId: itemId, displayName, docModel, topic });

            docModel.on('update', async () => this._handleDocUpdate(itemId));
          }
        }
      }
    });
  }

  async _assignRepo (topic, repo, username, token) {
    const repoPath = path.join(this._cwd, REPO_PATH, topic);
    if (await fs.exists(repoPath)) {
      throw new Error('Party has already being replicated to another repo.');
    }

    await fs.ensureDir(repoPath);
    await cloneRepo(repoPath, repo, username, token);

    this._botParties.set(topic, { topic, repo, repoPath });
  }

  async _handleDocUpdate (documentId) {
    const docInfo = this._docs.get(documentId);
    const { topic, lastUpdate = Date.now() } = docInfo;

    const trackedParty = this._botParties.get(topic) || {};
    const { repo, repoPath } = trackedParty;

    const pushToQueue = () => {
      this._queue.push({
        docInfo,
        repoPath
      }, err => console.error(err));
    };

    if (repo && repoPath) {
      if (docInfo.updateTimer) {
        clearTimeout(docInfo.updateTimer);
      }

      if (Date.now() - lastUpdate > MAX_UNCOMMITED_TIME) {
        pushToQueue();
      } else {
        docInfo.updateTimer = setTimeout(pushToQueue, GIT_UPDATE_TIMEOUT);
      }
    }
  }

  async _docUpdateHandler (options, cb) {
    const { docInfo, repoPath } = options;
    const { documentId, docModel } = docInfo;

    const text = docToMarkdown(docModel.doc);
    const docPath = path.join(repoPath, `${documentId}.md`);

    docInfo.lastUpdate = Date.now();

    fs.writeFile(docPath, text)
      .then(() => {
        return commitAndPush(repoPath);
      })
      .then(cb)
      .catch(cb);
  }
}
