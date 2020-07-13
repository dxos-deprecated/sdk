# Make Client construction not async, reduce dependencies

## Review: Current Flow (from react-client)

### react-client (ClientContextProvider)

- feedStorage: (random access storage)
- keyRing (KeyRing)
  - keyStorage: (memdb || leveldb)
(A) keyRing.load()

### createClient(feedStorage, keyRing, config)

- (A) feedStore: FeedStore.create(feedStorage, { ... })
- swarmProvider(config.swarm)
- networkManager(feedStore, swarmProvider)
- partyManager(feedStore, keyRing, networkManager)
(A) partyManager.init
- client(feedStore, networkManager, partyManager, keyRing, config)
(A) client._waitForPartiesToBeOpen

### Client(feedStore, networkManager, partyManager, keyRing, config)

- modelFactory(feedStore) (connects with partyManager thru _appendMessage, _getOwnershipInfo)

NOTES: 
- keyRing is only used for reset() and exposed thru getter
- networkManager is only used for destroy() and exposed thru getter 


### NetworkManager(feedStore, swarmProvider) (dxos/mesh)

NOTES: 
- `joinProtocolSwarm` Called from:
  - PartyManager (party-manager,  greeting-(responder, initiator))
  - BotFactory (?)
  - botkit-client (?)
  - peer-cli (?)
- Seems to be using `feedStore` ONLY to pass to createSwarm in joinProtocolSwarm (maybe add feedstore as param???) 
    - createSwarm(protocolProvider, protocolContext)
    ```
      const swarm = await this._swarmProvider.createSwarm(protocolProvider, { feedStore: this._feedStore });
    ```
- This seems a good candidate to be created by default inside Client, and allow to pass a networkManager by param.

### PartyManager(feedStore, keyRing, networkManager)

-- Oh no.

## Design

The desired design might be something like this:

```
const client = new Client({
  network,
  feedStore,
  keyRing
})

```

### From an app:

```
const feedStorage = createStorage(clientConfig.feedStorage.root, clientConfig.feedStorage.type);
const feedStore = new FeedStore(feedStorage, {
  feedOptions: {
    // TODO(burdon): Use codec.
    // TODO(dboreham): This buffer-json codec is required for party-manager to function.
    valueEncoding: 'buffer-json'
  },
  codecs: {
    'buffer-json': bufferJson
  }  
})

const keyStorage = clientConfig.keyStorage.type === 'memory' ? memdown()
  : leveljs(`${clientConfig.keyStorage.root}/keystore`);
const keyRing = new Keyring(new KeyStore(keyStorage));

const network = new NetworkManager(feedStore, new SwarmProvider(clientConfig.swarm)),

const client = new Client({
  network,
  feedStore,
  keyRing
})

```


### Issues & Questions:

The idea of a Client holding only `network`, `feedstore` and `keyring` seems a bit odd from a DX (dev experience) perspective:

- The very basic configuration is `signal`. This requires to create a NetworkManager, which needs a SwarmFactory in order to pass the signal config. 
   - Can we reduce NetworkManager surface to have swarmFactory created inside it if not provided?
- KeyRing requires an object that is created solely for it. So dev is required to know about keyRing AND keyStore.
   - Can we move that implementation detail into KeyRing?
- FeedStore creation cannot really be done outside Client. See the comment. PartyManager relies on a specific configuration for FeedStore.
   - Can we create the feedStore inside client? This would require to pass feedStorage as a param to client.

These issues might evolve into something like:

```
// Reduced API Surface for Client deps.

const client = new Client({
  network: new NetworkManager({ swarm: { signal, ice } }),
  feedStorage: createStorage(clientConfig.feedStorage.root, clientConfig.feedStorage.type),
  keyRing: new Keyring({ type, name })
})
```


Update(July 13th):
- NetworkManager also required a feedStore as first param.
- Remove NetworkManager. Add swarm config. Create SwarmProvider and NetworkManager internally.
- Rename feedStorage -> storage.
- Remove Keyring in favor of just KeyStore. Create Keyring internally.

```
// Reduced API Surface for Client deps.

const client = new Client({
  swarm: { signal, ice }, // For NetworkManager
  storage: createStorage(clientConfig.feedStorage.root, clientConfig.feedStorage.type), // for FeedStore, optional?
  keyStore: new KeyStore({ type, name }) // for Keyring, optional.
})
```


Update(July 13th):
- NetworkManager also required a feedStore as first param.
- Remove NetworkManager. Add swarm config. Create SwarmProvider and NetworkManager internally.
- Rename feedStorage -> storage.
- Remove Keyring in favor of just KeyStore. Create Keyring internally.

```
// Reduced API Surface for Client deps.

const client = new Client({
  swarm: { signal, ice }, // For NetworkManager
  storage: createStorage(clientConfig.feedStorage.root, clientConfig.feedStorage.type), // for FeedStore, optional?
  keyStore: new KeyStore({ type, name }) // for Keyring, optional.
})
```


### Implementation Details


```
class Client {
  constructor({ network , feedStore, keyRing }) {
    this.partyManager = ...
    this.modelFactory = new ModelFactory({ feedStore });
  }
  async initialize() {
    await this.keyRing.load()
    await this.partyManager.initialize()
    await this.modelFactory.initiailize()
    //...
  }  
  async destroy() {
    //...
    await this.modelFactory.destroy()
  }
}

```

```
await client.initialize()
//...

awit client.destroy()

//
// Test/Bot API
// Don't allow client.foo.bar.zoo()
//

client.getProfile().setUsername();
client.getDevices();
const contacts = client.getContacts();

// Don't expose PartyManager.
const party = await client.createParty();
const invitation = party.invite(contacts.find(name = 'alex'));

// Don't expose ModelFactory.
const result = await client.createSubscription({ party });          // Guided by Apollo subscriptions.

```



## Review of SDK packages

### react-client

Context to provide access to client instance via useClient and some other helpers related to client. (Auth, Profile, Party & Model)

- `useModel` client.modelFactory ...
- `useParty` relies on useParams(), that means it needs a router to be configured. REVIEW THIS.
- `useConfig` can we move it to react-appkit? It doesn't seems to belong here. Mostly used to retrieve publicUrl??
- `useProfile` client.partyManager.identityManager ....
- `useAuthenticator` client.partyManager.identityManager.deviceManager ...


### react-router

Define purpose

- `useQuery` ... Not sure WHY are we using search params?? Seems related to:
  - authenticator (invitations)
  - registration
  - wallet
 

### react-ux

Define purpose

- Material UI opinionated components. (This might be moved out of sdk and maybe refactored into small packages)

### react-appkit

Define purpose

-- Oh no.



## Possible Outcome

Initialize and perform `async` tasks **when** needed (initialize PartyManager?, read party messages?)

Create client and make it available thru Context.

```
// Root.js


// Do we need anything else other than client?

<DxOSProvider client={new Client()}>
</DxOSProvider>

// or just passing config?

<DxOSProvider config={{ ... }}>
</DxOSProvider>

```

Grab client from context:

```
const [client] = useClient()

// others that can be infered from feeds/data/client?
const [parties] = useParties()
const [profile] = useProfile()

```

Read Party ?

```

// This is state, it might be kept where dev decides to do so. 
// Dev should provide it and call setter. (Maybe from LocalStorage, URL state, memory, or anywhere else...)

const [party, setParty] = useParty(MY_PARTY)
```


Read Party Models ?

```
const [model] = useModel({ topic? })

```


Register ?

Authenticate ?

Invite ?

Create Party ?

