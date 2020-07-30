# Migration Doc for new SDK

Changes introduced in `v1.0.0-beta.215` deprecate usage of some SDK functionality:

- Calls to `createClient`
- Usage of `ClientContextProvider`

The `ClientContextProvider` internally called the `createClient`. Changes in code are required to avoid these depreacted functionality: Create a `client` instance and pass it to the new `ClientProvider`.

## Create Client

The new Client API requires to create some resources to be passed as parameters to call the constructor. These resources were previously constructed in `ClientContextProvider` and others in `createClient`.

### Depdendencies

We need to include these dependencies to create a `client` instance:

- "@dxos/random-access-multi-storage": "^1.1.0-beta.4"
- "level-js": "^5.0.1" (for keyring)
- "memdown": "^5.1.0" (if you want to create an in memory keyring)
- "@dxos/credentials": "^1.0.1-beta.17" (keyring)
- "@dxos/client": "^1.0.0-beta.215"

### Client construction

The client's constructor requires:

- a `storage` to instantiate a feedStore.
- a `swarm` config object. 
- a `keyring` to store indenty and keys. (This is optional, if not passed a simple `new Keyring()` will be instantiated.)


All three will be constructed in advance using the current configuration retrieved for each application or bot using the `@dxos/config` module.

```js
import { createStorage } from '@dxos/random-access-multi-storage';
import { Keyring, KeyStore } from '@dxos/credentials';
import { Client } from '@dxos/client';

// Read config
const cfg = await loadConfig();

// Extract values from config
const { client: { feedStorage, keyStorage, swarm }, ...config } = cfg.values;

// For storage we use feedStorage configuration:
const storage = createStorage(feedStorage.root, feedStorage.type);

// For keyring we use keyStorage configuration:
const keyring = new Keyring(new KeyStore(leveljs(`${keyStorage.root}/keystore`)));

// Finally construct the client. Notice we use the `client.swarm` config for `swarm` parameter:
const client = new Client({
  storage,
  swarm,
  keyring
});

// Finally we need to call initialize on the client.
// This is **not** required if passing the client to ClientProvider in a react app.
await client.initialize();

```


## Using the `ClientProvider`

Once we have a client instance constructed we can pass it to `ClientProvider` component, along with some other configuration that is being used in `react-appkit`:

In our previous code we can add the call to ReactDOM.render:

```jsx
// ...
// read config
// then create and initialize client

ReactDOM.render(
  <Root
    config={config}
    client={client}
  />,
  document.getElementById(cfg.get('app.rootElement'))
);

```
Our Root component might look like this:

```js
import React from 'react';
// ... more imports
import { ClientProvider } from '@dxos/react-client';

export default function Root ({ client, config }) {
  return (
    <ClientProvider client={client} config={config}>
      {/*  YOU APP GOES HERE */}
    </ClientProvider>
  )
}

```

Notice that the `config` parameter now contains allmost all but the `client` configuration. For the `ClientProvider` the only required config is `config.devtools` which, when set to `true` it will add a `__DXOS__` object into global scope for devtools usage.

When using the `ClientProvider` you are not required to call `client.initialize()` since it's been called in the Provider for you.