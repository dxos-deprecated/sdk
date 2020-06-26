//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import { useHistory } from 'react-router-dom';

import { InvitationDescriptor } from '@dxos/party-manager';
import { useAuthenticator } from '@dxos/react-client';
import { createPath, useQuery } from '@dxos/react-router';
import { FullScreen } from '@dxos/react-ux';

import AuthenticatorDialog from '../components/AuthenticatorDialog';
import { useAppRouter } from '../hooks';

/**
 * Handles inbound invitation URL.
 */
const Authenticator = () => {
  const history = useHistory();
  const invitation = InvitationDescriptor.fromQueryParameters(useQuery());
  const appRouter = useAppRouter();

  // TODO(burdon): Provide status of remote connection (e.g., show sender key; don't display PIN until connected).
  const [{ topic, identity, error }, setSecret] = useAuthenticator(invitation);
  if (topic) {
    appRouter.push({ topic });
  } else if (identity) {
    history.push(createPath());
  }

  const handleSubmit = async (value) => {
    setSecret(Buffer.from(value));
  };

  const handleCancel = () => {
    history.push(createPath());
  };

  return (
    <FullScreen>
      <AuthenticatorDialog
        error={error}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </FullScreen>
  );
};

export default Authenticator;
