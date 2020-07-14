//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useClient, useConfig } from '@dxos/react-client';
import { keyPairFromSeedPhrase, KeyType } from '@dxos/credentials';
import { keyToString } from '@dxos/crypto';
import { useQuery, createUrl } from '@dxos/react-router';
import { FullScreen } from '@dxos/react-ux';

import RegistrationDialog from '../components/RegistrationDialog';

const Registration = () => {
  const [open, setOpen] = useState(true);
  const history = useHistory();
  const { redirectUrl = '/', ...rest } = useQuery();
  const client = useClient();
  const config = useConfig();

  const handleFinish = async (username, seedPhrase) => {
    setOpen(false);

    // TODO(telackey): Replace with feedStore.deleteAll() once that is published in @dxos/feed-store
    // cf. https://github.com/dxos/feed-store/pull/13
    await Promise.all(client.feedStore.getDescriptors().map(({ path }) => client.feedStore.deleteDescriptor(path)));

    const identityKeyPair = keyPairFromSeedPhrase(seedPhrase);
    await client.keyring.addKeyRecord({ ...identityKeyPair, type: KeyType.IDENTITY });
    await client.partyManager.identityManager.initializeForNewIdentity({
      identityDisplayName: username || keyToString(client.partyManager.identityManager.publicKey),
      deviceDisplayName: keyToString(client.partyManager.identityManager.deviceManager.publicKey)
    });

    history.push(createUrl(redirectUrl, rest));
  };

  return (
    <FullScreen>
      <RegistrationDialog
        open={open}
        debug={config.debug.mode === 'development'}
        onFinish={handleFinish}
      />
    </FullScreen>
  );
};

export default Registration;
