//
// Copyright 2020 DXOS.org
//

import fs from 'fs-extra';
import path from 'path';

import { Bot } from '@dxos/botkit';
import { docToMarkdown, markdownToDoc } from '@dxos/editor-core';
import { TextModel, TYPE_TEXT_MODEL_UPDATE } from '@dxos/text-model';

import { Repo } from './repo';

const TYPE_EDITOR_DOCUMENT = 'wrn_dxos_org_teamwork_editor_document';
const REPO_PATH = './repos';

// Timeout after last model update event before saving to filesystem.
const FILE_UPDATE_TIMEOUT = 3000;
// Maximum postponing time of a filesystem write due to a continuous document updating.
const MAX_NON_UPDATED_TIME = 30000;
// Interval of repo polling for remote changes.
const REPO_PULL_INTERVAL = 60000;

/**
 * GitHub bot.
 */
export class GitHubBot extends Bot {
  /**
   * @type {Map<String, {documentId: String, displayName: String, topic: String, docModel: Model, lastSave: Number}>}
   */
  _docs = new Map();

  _botParties = new Map();

  constructor (config) {
    super(config);

    this.on('party', async (topic) => {
      await this.joinParty(topic);
    });
  }

  async botCommandHandler (message) {
    const command = JSON.parse(message.toString()) || {};
    let result = {};
    switch (command.type) {
      case 'status': {
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

  /**
   * Assign repo to a specific party.
   * @param {String} topic
   * @param {String} url
   * @param {String} username
   * @param {String} token
   */
  async _assignRepo (topic, url, username, token) {
    const repoPath = path.join(this._cwd, REPO_PATH, topic);
    if (await fs.exists(repoPath)) {
      throw new Error('Party has already being replicated to another repo.');
    }

    await fs.ensureDir(repoPath);

    const repo = new Repo(url, repoPath);
    await repo.clone(username, token);

    repo.on('pull', ({ merged }) => this.handleRepoPull(repoPath, merged));

    // TODO(egorgripasov): Configurable.
    setInterval(async () => {
      await repo.handleRepoPull();
    }, REPO_PULL_INTERVAL);

    this._botParties.set(topic, { topic, repo });
  }

  /**
   * @param {String} documentId
   */
  async _handleDocUpdate (documentId) {
    const docInfo = this._docs.get(documentId);
    const { docModel, topic, lastSave = Date.now() } = docInfo;

    const partyInfo = this._botParties.get(topic) || {};
    const { repo } = partyInfo;

    if (repo) {
      const updateDoc = async () => {
        const text = docToMarkdown(docModel.doc);
        const docPath = path.join(repo.repoPath, `${documentId}.md`);

        docInfo.lastSave = Date.now();

        await fs.writeFile(docPath, text);

        await repo.handleRepoPush();
      };

      if (docInfo.updateTimer) {
        clearTimeout(docInfo.updateTimer);
      }

      // Timer for file save.
      if (Date.now() - lastSave > MAX_NON_UPDATED_TIME) {
        await updateDoc();
      } else {
        docInfo.updateTimer = setTimeout(updateDoc, FILE_UPDATE_TIMEOUT);
      }
    }
  }

  async handleRepoPull (repoPath, newChanges) {
    if (newChanges) {
      // TODO(egorgripasov): Improve.
      const files = await fs.readdir(repoPath);
      for await (const file of files) {
        const match = file.match(/([0-9a-fA-F]{64})\./);
        if (match) {
          const [, documentId] = match;
          const docInfo = this._docs.get(documentId);
          if (docInfo) {
            const { docModel } = docInfo;
            const text = await fs.readFile(path.join(repoPath, file), 'utf8');

            markdownToDoc(text, docModel.doc);
          } else {
            // TODO(egorgripasov): Create new doc.
          }
        }
      }
    }
  }
}
