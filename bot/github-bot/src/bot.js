//
// Copyright 2020 DXOS.org
//

import fs from 'fs-extra';
import path from 'path';

import { Bot } from '@dxos/bot';
import { docToMarkdown, markdownToDoc } from '@dxos/editor-core';
import { TextModel } from '@dxos/text-model';

import { Repo } from './repo';

const EDITOR_TYPE_DOCUMENT = 'dxos.org/type/editor/document@v2';

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
   * @type {Map<String, {documentId: String, displayName: String, topic: String, doc: Model, lastSave: Number}>}
   */
  _docs = new Map();

  _botParties = new Map();

  constructor (config) {
    super(config);

    this.on('party', async (key) => {
      await this.joinParty(key);
    });
  }

  async _preInit () {
    this._client.registerModel(TextModel);
  }

  async botCommandHandler (command) {
    switch (command.type) {
      case 'status': {
        return [...this._botParties.values()];
      }
      case 'assign': {
        const { topic, repo, username, token } = command;
        let success = false;
        if (topic && this._botParties.has(topic) && repo) {
          await this._assignRepo(topic, repo, username, token);
          success = true;
        }
        return { success };
      }
      default:
        break;
    }
  }

  /**
   * Join party.
   * @param {PublicKey} key
   */
  async joinParty (key) {
    const topic = key.toHex();

    console.log(`Joining party '${topic}'.`);
    this._botParties.set(topic, { topic });

    const party = this._client.echo.getParty(key);

    const result = party.database.queryItems({ type: EDITOR_TYPE_DOCUMENT });

    result.subscribe(async () => {
      await this.readDocuments(result.value, topic);
    });
    await this.readDocuments(result.value, topic);
  }

  async readDocuments (documents, topic) {
    for await (const doc of documents) {
      const documentId = doc.id;

      this._docs.set(documentId, { documentId, doc, topic });
      this._handleDocUpdate(documentId);
    }
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
    const { doc, topic, lastSave = Date.now() } = docInfo;

    const partyInfo = this._botParties.get(topic) || {};
    const { repo } = partyInfo;

    if (repo) {
      const updateDoc = async () => {
        const text = docToMarkdown(doc.children[0].model.doc);
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
            const { doc } = docInfo;
            const text = await fs.readFile(path.join(repoPath, file), 'utf8');

            markdownToDoc(text, doc.children[0].model.doc);
          } else {
            // TODO(egorgripasov): Create new doc.
          }
        }
      }
    }
  }
}
