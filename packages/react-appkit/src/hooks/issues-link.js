//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

export const useIssuesLink = () => {
  const { issuesLink } = useContext(AppKitContext);
  return [issuesLink];
};
