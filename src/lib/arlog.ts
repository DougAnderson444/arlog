import Arweave from 'arweave';
import { CONTRACT_ID, APP_WALLET, MAX_REQUEST } from '$lib/utils/constants';
import { arConfig } from './config/index.js';

let arweave;

let dev = import.meta.env.DEV || false;

let contractID = !dev && CONTRACT_ID;

export default class Arlog {
	constructor(arConfig) {
		this.arweave = Arweave.init(arConfig);
	}

    getArConfig() {
        return arConfig;
    };

	async load(keyfile) {
		this.keyfile = keyfile;
		this.ownerAddress = await this.arweave.wallets.getAddress(this.keyfile);
	}

	async deployContract() {
		const { deploy } = await import('$lib/contract/deploy.js');
		contractID = await deploy({
			client: this.arweave,
			payer: this.keyfile,
			owner: this.ownerAddress
		}); // generate a testWeave contractID
		console.log('contractID deployed', { contractID });

		const after = await this.arweave.transactions.getStatus(contractID);
		console.log({ after }); // this will return 202

		if (after.status !== 202) new Error('error, contract not deployed'); // TODO: handle better

		let fin;

		try {
			console.log('Mining...');
			await testWeave.mine(); // mine the contract
			await testWeave.mine(); // mine the contract
			console.log('Mined!');
			fin = await this.arweave.transactions.getStatus(contractID);
			console.log({ fin }); // this will return 202
		} catch (error) {
			console.error(error);
			return `Error ${error}`;
		}
		try {
			console.log(fin.confirmed.block_indep_hash);
			const result = await this.arweave.blocks.get(fin.confirmed.block_indep_hash);
			console.log({ result });
		} catch (error) {
			console.error(error);
		}
		return contractID;
	}

	async getAll() {
		// assertLoaded()
		const networkInfo = await this.arweave.network.getInfo();
		const height = networkInfo.height;

		let variables: ReqVariables = {
			owner: {
				address: this.ownerAddress
			},
			tags: [
				{
					name: 'App-Name',
					values: ['SmartWeaveAction']
				}
			],
			blockFilter: {
				max: height
			},
			first: MAX_REQUEST
		};
		let transactions = await this.getNextPage(this.arweave, variables);
		console.log({ transactions });
		if (transactions.edges.length < 1) return false;
		return transactions;
	}

	async getNextPage(
		arweave: Arweave,
		variables: ReqVariables
	): Promise<GQLTransactionsResultInterface> {
		const query = `query Transactions($tags: [TagFilter!]!, $blockFilter: BlockFilter!, $first: Int!, $after: String) {
            transactions(tags: $tags, block: $blockFilter, first: $first, sort: HEIGHT_ASC, after: $after) {
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

		// hack because testweave looks at :1984/graphql instead of :3000/graphql
		arweave = Arweave.init({
			host: 'localhost',
			port: 3000,
			protocol: 'http',
			timeout: 20000,
			logging: false
		});

		const response = await arweave.api.post('graphql', {
			query,
			variables
		});

		if (response.status !== 200) {
			throw new Error(
				`Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`
			);
		}

		const data: GQLResultInterface = response.data;
		const txs = data.data.transactions;

		return txs;
	}
}
