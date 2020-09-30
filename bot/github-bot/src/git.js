//
// Copyright 2020 DXOS.org
//

import Git from 'simple-git';

/**
 * @param {String} repoPath
 * @param {String} repo
 * @param {String} username
 * @param {String} token
 */
export const cloneRepo = async (repoPath, repo, username, token) => {
  const git = Git(repoPath);

  const fullUrl = (username && token) ? `${repo.replace('://', '://' + username + ':' + token + '@')}` : repo;
  await git.clone(fullUrl, '.');
};

/**
 * @param {String} repoPath
 * @param {String} message
 */
export const commitAndPush = async (repoPath, message = `Update ${Date.now()}`) => {
  const git = Git(repoPath);

  await git.add('.');
  await git.commit(message);
  await git.push();
};

/**
 * @param {String} repoPath
 */
export const pullRepo = async (repoPath) => {
  const git = Git(repoPath);
  await git.fetch();
  const status = await git.status();
  if (status.behind > 0) {
    await git.merge('origin', 'master', { '-X': 'ours' });
  }
};
