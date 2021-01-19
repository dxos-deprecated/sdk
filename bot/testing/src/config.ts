//
// Copyright 2020 DXOS.org
//

// TODO(egorgripasov): Factor out (use config from ~/.wire?).
export const CONFIG = {
  DX_SIGNAL_ENDPOINT: 'wss://apollo2.kube.moon.dxos.network/dxos/signal',
  DX_ICE_ENDPOINTS: '[{"urls":"stun:apollo1.kube.moon.dxos.network:3478"},{"urls":"turn:apollo1.kube.moon.dxos.network:3478","username":"dxos","credential":"dxos"},{"urls":"stun:apollo2.kube.moon.dxos.network:3478"},{"urls":"turn:apollo2.kube.moon.dxos.network:3478","username":"dxos","credential":"dxos"}]',
  DX_REGISTRY_ENDPOINT: 'https://wns1.kube.moon.dxos.network/api',
  DX_REGISTRY_USER_KEY: undefined,
  DX_REGISTRY_BOND_ID: undefined,
  DX_REGISTRY_CHAIN_ID: 'devnet-2',
  DX_IPFS_SERVER: 'https://apollo2.kube.moon.dxos.network/dxos/ipfs/api',
  DX_IPFS_GATEWAY: 'https://apollo2.kube.moon.dxos.network/dxos/ipfs/gateway/'
};

export const FACTORY_OUT_DIR = './out';
