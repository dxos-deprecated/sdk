//
// Copyright 2020 DXOS.org
//

import { useEffect, useState, useMemo } from 'react';
import assert from 'assert';

import { trigger } from '@dxos/async';
import { generatePasscode } from '@dxos/credentials';
import { keyToString } from '@dxos/crypto';
import { InviteType, InvitationDescriptor } from '@dxos/party-manager';

import { useClient } from './client';

const encodeInvitation = (invitation) => btoa(JSON.stringify(invitation.toQueryParameters()));
const decodeInvitation = (code) => InvitationDescriptor.fromQueryParameters(JSON.parse(atob(code)));

const noOp = () => {};

/**
 * Hook to redeem an invitation Code and provide the PIN authentication if needed.
 * @param {Object} options
 * @param {(party: Party) => void} options.onDone called once the redeem flow finishes successfully.
 * @param {() => void} options.onError called if the invite flow produces an error.
 * @returns {[redeemCode: (code: String) => void, setPin: (pin: String) => void ]}
 */
export function useInvitationRedeemer ({ onDone = noOp, onError = noOp } = {}) {
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
 * @param {Party} party the Party to create invite for. Required.
 * @param {Object} options
 * @param {() => void} options.onDone called once the invite flow finishes successfully.
 * @param {() => void} options.onError called if the invite flow produces an error.
 * @returns {[invitationCode: String, pin: String ]}
 */
export function useInvitation (party, { onDone = noOp, onError = noOp } = {}) {
  assert(party);
  const client = useClient();
  const [invitationCode, setInvitationCode] = useState();
  const [pin, setPin] = useState();
  const partyKey = keyToString(party.publicKey);

  useEffect(() => {
    client.createInvitation(
      party.publicKey,
      () => {
        const pin = generatePasscode();
        setPin(pin);
        return Buffer.from(pin);
      },
      { onFinish: () => onDone() })
      .then(invitation => setInvitationCode(encodeInvitation(invitation)))
      .catch(error => onError(error));
  }, [partyKey]);

  return [
    invitationCode,
    pin
  ];
}

/**
 * Hook to create an Offline Invitation for recipient to a given party
 * @param {Party} party the party to create invite for. Required.
 * @param {Contact|{ publicKey: {Buffer} }} recipient the recipient for the invitation. Required.
 * @param {Object} options
 * @param {() => void} options.onDone called once the invite flow finishes successfully.
 * @param {() => void} options.onError called if the invite flow produces an error.
 * @returns {[invitationCode: String ]}
 */
export function useOfflineInvitation (party, recipient, { onDone = noOp, onError = noOp } = {}) {
  assert(party);
  assert(recipient);
  const client = useClient();
  const [invitationCode, setInvitationCode] = useState();
  const partyKey = keyToString(party.publicKey);
  const recipientKey = keyToString(recipient.publicKey);

  useEffect(() => {
    client.createOfflineInvitation(party.publicKey, recipient.publicKey)
      .then(invitation => {
        setInvitationCode(encodeInvitation(invitation));
        onDone();
      })
      .catch(error => onError(error));
  }, [partyKey, recipientKey]);

  return [
    invitationCode
  ];
}
