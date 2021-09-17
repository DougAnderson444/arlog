# ArLog 🆁🌲

Append only log of data in Arweave. Likely pointing to your root CID of you IPFS Merkle DAG, or even a log of Arweave Tx; a chain of updates.

Takes your data, sends it to the smart contract, if it's sent by the owner, adds it to the owner's log.

```
npm install github:douganderson444/arlog
```

## Usage

Most of the time this log will be hard coded into a program somewhere, using the ContractID (Transaction ID for the saved contract state). So you need functions that 

1. list all owner contracts, (ownerAddress)
2. read a contract, and (contractID)
3. create a new log (ownerKeyfile)
4. write to an existing contract (ownerKeyfile, contractID, entry)

```js

// CREATE
import Arlog from 'github:douganderson444/arlog';

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
const { result, state } = await arlog.write(ownerKeyfile, contractID, input, { tags = [], target = null, winstonQty = null })

// DELETE
// error: Permaweb, cannot delete. It's there forever unless you ask nodes to remove for you.

```

## API

`const log = new Arlog(arweaveClientInstance: Arweave)`

Makes a new log using your arweave instance.


`latestEntry = await log.read(ownerAddress: string)`

Fetches log entries for this owner's Arweave address (keyfile Public Key). Returns the latest state of all logs, unless a namespace is specified, then only returns that one.

`contractID = await arlog.createNewLog(ownerKeyfile: keyfile [, details: Object])`

Returns a contractID for the newly created and deployed owner keyfile

`const { result, state } = await arlog.write(ownerKeyfile, contractID, input, { tags = [], target = null, winstonQty = null })`



## Contract

Program is a SmartWeave smart contract, written in JS.

## Demo

To run the demo, just launch the svelte app

```
npm run dev
```
