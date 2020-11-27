//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { keyPairFromSeedPhrase } from '@dxos/credentials';
import { useClient, useConfig } from '@dxos/react-client';
import { useQuery, createUrl } from '@dxos/react-router';
import { FullScreen } from '@dxos/react-ux';

import RegistrationDialog from '../components/RegistrationDialog';

const Registration = () => {
  const [open, setOpen] = useState(true);
  const history = useHistory();
  const { redirectUrl = '/', ...rest } = useQuery();
  const client = useClient();
  const config = useConfig();

  const clearIdentity = async () => {
    setOpen(false);

    // TODO(telackey): Replace with feedStore.deleteAll() once that is published in @dxos/feed-store
    // cf. https://github.com/dxos/feed-store/pull/13
    await Promise.all(client.feedStore.getDescriptors().map(({ path }) => client.feedStore.deleteDescriptor(path)));
  };

  const handleFinishCreate = async (username, seedPhrase) => {
    await clearIdentity();
    const identityKeyPair = keyPairFromSeedPhrase(seedPhrase);
    await client.createProfile({ ...identityKeyPair, username });

    // await client.partyManager.identityManager.initializeForNewIdentity({
    //   identityDisplayName: username || keyToString(client.partyManager.identityManager.publicKey),
    //   deviceDisplayName: keyToString(client.partyManager.identityManager.deviceManager.publicKey)
    // });

    history.push(createUrl(redirectUrl, rest));
  };

  const handleFinishRestore = async (seedPhrase) => {
    await clearIdentity();
    await client.echo.recoverHalo(seedPhrase);
    history.push(createUrl(redirectUrl, rest));
  };

  return (
    <FullScreen>
      <RegistrationDialog
        open={open}
        debug={config.debug.mode === 'development'}
        onFinishCreate={handleFinishCreate}
        onFinishRestore={handleFinishRestore}
      />
    </FullScreen>
  );
};

export default Registration;
