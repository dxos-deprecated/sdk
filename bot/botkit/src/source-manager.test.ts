import { SourceManager } from "./source-manager"
import { Config } from '@dxos/config';
import { createId } from "@dxos/crypto";
import { existsSync } from "fs-extra";

test('Download & install bot', async () => {
  const sourceManager = new SourceManager(new Config({
     localDev: false,
     services: {
       ipfs: {
         gateway: 'https://apollo1.kube.moon.dxos.network/dxos/ipfs/gateway/',
       }
     }
  }))

  const installDirectory = await sourceManager.downloadAndInstallBot(createId(), 'QmPTxbghFFjz59NyXMJwYCAAbhK4etNagybWUKJGaEFU5F', {});

  expect(existsSync(installDirectory)).toBe(true); 
}, 20_000)
