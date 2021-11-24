import Arweave from 'arweave';
import { SmartweaveFactory } from './smartweave';
import { readContract, interactWrite } from 'smartweave';
import config, { MAX_REQUEST } from './config';
import { get } from 'svelte/store';
import { selectedNetwork } from './stores.js';
export default class Arlog {
    constructor(config) {
        this.config = config;
        this.arweave = Arweave.init(config.arweave);
        this.smartweave = new SmartweaveFactory(config); // not really needed
    }
    async read(contractID) {
        try {
            const state = await readContract(this.arweave, contractID);
            return state;
        }
        catch (error) {
            return new Error('Read failed');
        }
    }
    async doMining() {
        // mine for this test setup
        // ArLocal, arweave.run, and redstone configs are fecth(.../mine)
        // testweave is .mine()
        // config.mine()
        const network = config.networks[get(selectedNetwork)];
        console.log(`Mining on`, { network });
        await network.mine(this);
    }
    async createNewLog(payerWallet, opts = {}) {
        return await this.deployContract(payerWallet, opts);
    }
    async write(payerWallet, contractID, input, opts = {}) {
        const { tags = [], target = null, winstonQty = null } = opts;
        // Legacy:
        let txid = await interactWrite(this.arweave, payerWallet, contractID, input, tags, target, winstonQty);
        // redstone:
        // const txid = await contract.writeInteraction({
        // 	function: input.function,
        // 	data: input.latest
        // });
        console.log({ txid });
        if (!txid)
            return new Error('Error writing to contract');
        return txid;
    }
    async getAddress(keyfile) {
        return await this.arweave.wallets.getAddress(keyfile);
    }
    async deployContract(payer, { name = 'myArLog', owner = '', latest = {
        ipfs: 'QmWB4HTz8G9RQeNumjFqHeHD7ziVkC3bfxWe37oEE75LZv',
        arweave: 'generated Arweave Tx Id for the data'
    }, source = false }) {
        const { deploy } = await import('./contract/deploy.js');
        owner = owner || (await this.getAddress(payer));
        let contractID = await deploy({
            client: this.arweave,
            payer,
            details: {
                name,
                owner,
                latest
            },
            source
        }); // generate a contractID
        console.log('contractID deployed', { contractID });
        const after = await this.arweave.transactions.getStatus(contractID);
        if (after.status !== 200 && after.status !== 202)
            return new Error('error, contract not deployed'); // TODO: handle better
        return contractID;
    }
    async list(owner) {
        // assertLoaded()
        const networkInfo = await this.arweave.network.getInfo();
        console.log({ networkInfo });
        const height = networkInfo.height;
        let variables = {
            owners: owner,
            tags: [
                {
                    name: 'App-Name',
                    values: ['SmartWeaveContract']
                }
                // doesnt work for some strange reason in GQL
                // {
                // 	name: "Content-Type",
                // 	values: ["application/json"]
                // }
            ],
            blockFilter: {
                max: height
            },
            first: MAX_REQUEST
        };
        let transactions = await this.getNextPage(this.arweave, variables);
        if (transactions.edges.length < 1)
            return false;
        return transactions;
    }
    async getNextPage(arweave, variables) {
        const query = `query Transactions($tags: [TagFilter!]!, $owners: String!) {
                        transactions(tags: $tags, owners: [$owners], sort: HEIGHT_DESC) {
                        pageInfo {
                            hasNextPage
                        }
                        edges {
                            node {
								id
								owner { address }
								tags {
									name
									value
								}
								block { timestamp }
                            	}
                            cursor
                        	}
                        }
                    }`;
        const response = await arweave.api.post('graphql', {
            query,
            variables
        });
        console.log({ response });
        if (response.status !== 200) {
            throw new Error(`ArLog Error: Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`);
        }
        const data = response.data;
        const txs = data.data.transactions;
        return txs;
    }
    // fetch all contract interactions up to the specified block height
    async fetchTransactions(contractId, height) {
        if (!height) {
            const networkInfo = await this.arweave.network.getInfo();
            height = networkInfo.height;
        }
        let variables = {
            tags: [
                {
                    name: 'App-Name',
                    values: ['SmartWeaveAction'] // SmartWeaveContract
                },
                {
                    name: 'Contract',
                    values: [contractId]
                }
            ],
            blockFilter: {
                max: height
            },
            first: MAX_REQUEST
        };
        const query = `query Transactions($tags: [TagFilter!]!, $blockFilter: BlockFilter!, $first: Int!, $after: String) {
			transactions(tags: $tags, block: $blockFilter, first: $first, sort: HEIGHT_DESC, after: $after) {
			pageInfo {
				hasNextPage
			}
			edges {
				node {
				id
				owner { address }
				recipient
				tags {
					name
					value
				}
				block {
					height
					id
					timestamp
				}
				fee { winston }
				quantity { winston }
				parent { id }
				}
				cursor
			}
			}
		}`;
        const response = await this.arweave.api.post('graphql', {
            query,
            variables
        });
        if (response.status !== 200) {
            throw new Error(`Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`);
        }
        const data = response.data;
        let transactions = data.data.transactions;
        const txInfos = transactions.edges.filter((tx) => !tx.node.parent || !tx.node.parent.id);
        while (transactions.pageInfo.hasNextPage) {
            const cursor = transactions.edges[MAX_REQUEST - 1].cursor;
            variables = {
                ...variables,
                after: cursor
            };
            transactions = await this.getNextPage(arweave, variables);
            txInfos.push(...transactions.edges.filter((tx) => !tx.node.parent || !tx.node.parent.id));
        }
        return txInfos;
    }
}
