# ArLog 🆁🌲

Append only log of data in Arweave.

Deploy with ArLog if you want to update your website in the future.

Demo uses ArLog to point to root CID of IPFS Merkle DAG, which can be peered by either you or pinned on Arweave as well. Maintains a chain of CID update for your records and convenience.

Under the hood, ArLog takes your data (root CID), sends the CID to the smart contract, and if it was sent by the Arweave keyfile owner, adds it to the owner's log.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [Demo](#demo)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Background

So, you want to save your app to Web3, eh? What about updates? Well, you'd have to send all your contacts a brand new link.

ArLog solves this problem by making the LINK permanent (and persistent) and that LINK points to the latest value, whether it is:

- an IPFS CID
- an Arweave data Transaction ID
- a Solana address
- ...or whatever, really

## ArLog Deploy Protocol: How it Works

1. ArLog takes your first deployment and creates a contractID
2. Arlog deploy --wrapper embeds this contract ID in an HTML Wrapper. Otherwise go to FQDN/contractID to get the latest values
3. ArLog looks up the latest IPFS value if it exists/loads, then falls back to the ArWeave Tx
4. The data is then displayed if it is HTML

## Install

```
npm install github:@douganderson444/arlog
```

## Usage

Most of the time this log will be hard coded into a program somewhere, a program designed to fetch the latest CID from the SmartWeave Contract using the given ContractID (Transaction ID for the saved contract state). So you need functions that:

1. List all owner contracts, (ownerAddress)
2. Reads a contract (contractID)
3. Create a new log for a keyfile owner (ownerKeyfile)
4. Write to an existing contract for a keyfile owner (ownerKeyfile, contractID, entry)

```js

// CREATE
import Arlog from '@douganderson444/arlog';

// you'll need an arweave instance, and a wallet
let arweaveClientInstance = Arweave.init(config);

// use the arlog instance to load namespaces for any owner
const arlog = new Arlog(arweaveClientInstance);

// list all the logs for this owner
const allLogs = await arlog.list(ownerAddress)

// read the state of pick a log and get the details
const logData = await arlog.read(contractID) // most owners will only have/need one namespace

const contractID = await arlog.createNewLog(ownerKeyfile [, details])

// Write the latest entry for this namespace
const finished = await arlog.write(ownerKeyfile, contractID, input, { tags = [], target = null, winstonQty = null })

// DELETE
// error: Permaweb, cannot delete. It's there forever unless you ask nodes to remove for you.

```

### Demo

To run the demo, just launch the svelte app

```
npm run dev
```

## API

#### `const log = new Arlog(arweaveClientInstance: Arweave)`

Makes a new log using your arweave instance.

#### `latestEntry = await log.read(ownerAddress: string)`

Fetches log entries for this owner's Arweave address (keyfile Public Key). Returns the latest state of all logs, unless a namespace is specified, then only returns that one.

#### `contractID = await arlog.createNewLog(ownerKeyfile: keyfile [, details: Object])`

Returns a contractID for the newly created and deployed owner keyfile

#### `const { result, state } = await arlog.write(ownerKeyfile, contractID, input, { tags = [], target = null, winstonQty = null })`

## Contract

Program is a SmartWeave smart contract, written in JS.

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

### Dev Notes

In order to develop, you'll need to run [testweave-docker](https://github.com/ArweaveTeam/testweave-docker) on your local machine.

```cli
docker-compose up
```

or

```cli
docker compose up
```

Be sure to `docker system prune` if you run into issues when trying to mine locally.

## License

[MIT © Doug Anderson (aka @douganderson444)](./LICENSE)
