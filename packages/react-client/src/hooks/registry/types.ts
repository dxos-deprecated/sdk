//
// Copyright 2020 DXOS.org
//

// TODO(burdon): Factor out constants to client.
export const DXN_TYPE_BOT = 'dxn:bot';
export const DXN_TYPE_BOT_FACTORY = 'dxn:bot-factory';

// Registry client has no types
export interface QueryRecord {
  attributes: {
    version: string,
    name: string,
    topic: string,
    keywords?: string[]
  },
  names: string[]
}
