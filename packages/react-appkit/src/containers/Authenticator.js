//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { useHistory } from 'react-router-dom';

import { InvitationDescriptor, InvitationDescriptorType } from '@dxos/echo-db';
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
  console.log('useAuthenticator gets us: ', { topic, identity, error })
  if (topic) {
    appRouter.push({ topic });
  } else if (identity) {
    // console.log('pushing ', createPath())
    history.push(createPath());
    // window.location.replace(createPath())
  }

  const handleSubmit = async (value) => {
    setSecret(Buffer.from(value));
  };

  const handleCancel = () => {
    history.push(createPath());
  };

  const recognisedError = error &&
    error.includes('ERR_GREET_INVALID_INVITATION') &&
    'The invitation does not exist or the attempted access to it was unauthorized.';

  return (
    <FullScreen>
      <AuthenticatorDialog
        error={error}
        recognisedError={recognisedError}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOfflineKeyInvitation={invitation.type === InvitationDescriptorType.OFFLINE_KEY}
      />
    </FullScreen>
  );
};

export default Authenticator;
