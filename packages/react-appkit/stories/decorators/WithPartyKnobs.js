//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { button, select } from '@storybook/addon-knobs';

import { useClient, useParties } from '@dxos/react-client';
import { keyToString } from '@dxos/crypto';
import { Redirect } from 'react-router-dom';

/**
 * This decorator requires:
 * - a ClientProvider on top in the hierarchy tree.
 * - a StoryRouter on top on the hierarchy tree.
 * @param {*} story
 */
export const WithPartyKnobs = (story) => {
  return (<RenderPartyKnobs story={story} />);
};

function RenderPartyKnobs ({ story }) {
  const client = useClient();
  const parties = useParties();

  const options = parties.reduce((prev, p) => {
    const key = keyToString(p.publicKey);
    return {
      ...prev,
      [key]: key
    };
  }, { None: undefined });

  button('Create Party', () => { client.partyManager.createParty(); });
  const partyKey = select('Select Party', options, undefined);

  return (
    <div className='withPartyKnobs'>
      {story()}
      <Redirect to={`/${partyKey || ''}`} />
    </div>);
}
