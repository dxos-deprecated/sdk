//
// Copyright 2020 DXOS.org
//

import Git from 'simple-git';

export const cloneRepo = async (repoPath, repo, username, token) => {
  const git = Git(repoPath);

  const fullUrl = (username && token) ? `${repo.replace('://', '://' + username + ':' + token + '@')}` : repo;
  await git.clone(fullUrl, '.');
};

export const commitAndPush = async (repoPath, message = `Update ${Date.now()}`) => {
  const git = Git(repoPath);

  await git.add('.');
  await git.commit(message);
  await git.push();
};
