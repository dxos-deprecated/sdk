//
// Copyright 2020 DXOS.org
//

import { useEffect, useState, useMemo } from 'react';

import { trigger } from '@dxos/async';
import { generatePasscode } from '@dxos/credentials';
import { InviteType, InvitationDescriptor } from '@dxos/party-manager';

import { useClient } from './client';

const encodeInvitation = (invitation) => btoa(JSON.stringify(invitation.toQueryParameters()));
const decodeInvitation = (code) => InvitationDescriptor.fromQueryParameters(JSON.parse(atob(code)));

const noOp = () => {};

/**
 * Hook to redeem an invitation Code and provide the PIN authentication if needed.
 * @param {Object} options
 * @param {(party: Party) => void} options.onDone called once the redeem flow finishes successfully.
 *
 * @returns {[redeemCode: (code: String) => void, setPin: (pin: String) => void ]}
 */
export function useRedeem ({ onDone = noOp, onError = noOp } = {}) {
  const client = useClient();
  const [code, setCode] = useState();
  const [resolver, setResolver] = useState();
  const [secretProvider, secretResolver] = useMemo(() => trigger(), [code]);

  useEffect(() => {
    if (!code) {
      return;
    }

    try {
      const invitation = decodeInvitation(code);

      if (InviteType.INTERACTIVE === invitation.type) {
        setResolver(true);
      }

      client.joinParty(invitation, secretProvider)
        .then(party => onDone(party))
        .catch(error => onError(error));
    } catch (error) {
      onError(error);
    }
  }, [code]);

  return [
    setCode, // redeemCode
    resolver ? pin => secretResolver(Buffer.from(pin)) : undefined // setPin
  ];
}

/**
 * Hook to create an Invitation for a given party
 * @param {Object} options
 * @param {Party} options.party the Party to create invite for. Required.
 * @param {() => void} options.onDone called once the invite flow finishes successfully.
 *
 * @returns {[invitationCode: String, pin: String ]}
 */
export function useInvite ({ party, onDone = noOp, onError = noOp }) {
  const client = useClient();
  const [invitationCode, setInvitationCode] = useState();
  const [pin, setPin] = useState();
  const topic = party ? party.publicKey.toString('hex') : '';

  useEffect(() => {
    client.inviteToParty(
      party.publicKey,
      () => {
        const pin = generatePasscode();
        setPin(pin);
        return Buffer.from(pin);
      },
      { onFinish: () => onDone() })
      .then(invitation => setInvitationCode(encodeInvitation(invitation)))
      .catch(error => onError(error));
  }, [topic]);

  return [
    invitationCode,
    pin
  ];
}

export function useInviteContact ({ party, contact, onDone = noOp, onError = noOp }) {
  const client = useClient();
  const [invitationCode, setInvitationCode] = useState();
  const topic = party ? party.publicKey.toString('hex') : '';
  const contactKey = contact ? contact.publicKey.toString('hex') : '';

  useEffect(() => {
    client.inviteContactToParty(party.publicKey, contact)
      .then(invitation => {
        setInvitationCode(encodeInvitation(invitation));
        onDone();
      })
      .catch(error => onError(error));
  }, [topic, contactKey]);

  return [
    invitationCode
  ];
}
