//
// Copyright 2020 DXOS.
//

// TODO(burdon): All defaults must be localhost.
const DEFAULT_ICE_ENDPOINTS = [{ urls: 'stun:stun.wireline.ninja:3478' }];
const DEFAULT_SIGNAL_ENDPOINT = 'ws://localhost:4000';

// NOTE: There are external, network dependencies on the signal server used for peer discovery and on the
// STUN/TURN (ICE) servers required by SimplePeer for WebRTC connectivity.

// TODO(burdon): Remove.
export const defaultClientConfig = {
  swarm: {
    signal: process.env.WIRE_SIGNAL_ENDPOINT || DEFAULT_SIGNAL_ENDPOINT,
    ice: process.env.WIRE_ICE_ENDPOINTS ? JSON.parse(process.env.WIRE_ICE_ENDPOINTS) : DEFAULT_ICE_ENDPOINTS
  }
};
