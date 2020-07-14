//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { PageContent as SharedPageContent } from '@dxos/docs-theme/dist/src/components/pageContent';

const GITHUB_URL = 'dxos/sdk/docs/content';

export default function PageContent ({ children, ...rest }) {
  return (
    <SharedPageContent {...rest} githubUrl={GITHUB_URL}>
      {children}
    </SharedPageContent>
  );
}
