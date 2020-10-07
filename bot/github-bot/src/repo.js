//
// Copyright 2020 DXOS.org
//

import Queue from 'fastq';
import { callbackify } from 'util';
import { EventEmitter } from 'events';

import { cloneRepo, commitAndPush, pullRepo } from './git';

const commitAndPushAsync = callbackify(commitAndPush);
const pullRepoAsync = callbackify(pullRepo);

// Timeout after last filesystem update before updating repo.
const GIT_UPDATE_TIMEOUT = 20000;
// Maximum postponing time of an updating repo due to a continuous saving to filesystem.
const MAX_NON_COMMITED_TIME = 60000;

const ACTION_PUSH = 'push';
const ACTION_PULL = 'pull';

const WORKERS_NUM = 1;

export class Repo extends EventEmitter {
  _lastUpdate = undefined;
  _updateTimer = undefined;

  constructor (repo, repoPath) {
    super();

    this._repo = repo;
    this._repoPath = repoPath;

    this._queue = Queue(this, this.updateRepo, WORKERS_NUM);
  }

  get lastUpdate () {
    return this._lastUpdate || Date.now();
  }

  set lastUpdate (value) {
    this._lastUpdate = value;
  }

  get repoPath () {
    return this._repoPath;
  }

  async handleRepoPush () {
    // Timer for git operations.
    const pushToQueue = () => {
      this._queue.push({
        repoPath: this._repoPath,
        type: ACTION_PUSH
      }, err => err && console.error(err));
    };

    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
    }

    if (Date.now() - this.lastUpdate > MAX_NON_COMMITED_TIME) {
      pushToQueue();
    } else {
      this._updateTimer = setTimeout(pushToQueue, GIT_UPDATE_TIMEOUT);
    }
  }

  async handleRepoPull () {
    this._queue.push({
      repoPath: this._repoPath,
      type: ACTION_PULL
    }, err => console.error(err));
  }

  async clone (username, token) {
    await cloneRepo(this._repoPath, this._repo, username, token);
  }

  /**
   * Worker function for queue.
   * @param {{ repoPath }} options
   * @param {Function} cb
   */
  updateRepo (options, cb) {
    const { repoPath, type } = options;

    if (type === ACTION_PUSH) {
      commitAndPushAsync(repoPath, cb);
    } else if (type === ACTION_PULL) {
      pullRepoAsync(repoPath, (err, result) => {
        if (!err) {
          this.emit('pull', result);
        }
        cb(err, result);
      });
    }
  }
}
