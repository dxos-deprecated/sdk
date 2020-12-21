//
// Copyright 2020 DXOS.org
//

/* global chrome */

import { initDevTool } from '../../../devtools/dist/src';
import BridgeProxy from './bridge';

declare var chrome: any;

const injected = false;

initDevTool({
  connect (onConnect) {
    const bridge = new BridgeProxy();
    onConnect(bridge);

    if (!injected) {
      bridge.injectClientScript();
    }
  },

  tabId: chrome.devtools.inspectedWindow.tabId,

  onReload (reloadFn) {
    chrome.devtools.network.onNavigated.addListener(reloadFn);
  }
});
