import Arweave from 'arweave';
import { readContract, interactWrite, interactWriteDryRun } from 'smartweave';
import { CONTRACT_ID, APP_WALLET, MAX_REQUEST } from '$lib/utils/constants';

let arweave;

let dev = import.meta.env.DEV || false;

let contractID = !dev && CONTRACT_ID;

interface TagFilter {
	name: string;
	values: string[];
}

interface BlockFilter {
	max: number;
}

interface ReqVariables {
	owners: string;
	tags: TagFilter[];
	blockFilter: BlockFilter;
	first: number;
	after?: string;
}

export default class Arlog {
	constructor(arweave) {
		this.arweave = arweave;
	}

	async read(contractID) {
		return await readContract(this.arweave, contractID);
	}

	async createNewLog(ownerKeyfile, opts = {}) {
		return await this.deployContract(ownerKeyfile, opts);
	}

	pickNameFromList(contractStates, namespace) {
		const contractState = contractStates.find((contractState) => contractState.name == namespace);

		return contractState;
	}

	async write(ownerKeyfile, contractID, input, opts = {}) {
		const { tags = [], target = null, winstonQty = null } = opts
		let txid = await interactWrite(
			this.arweave,
			ownerKeyfile,
			contractID,
			input,
			tags,
			target,
			winstonQty
		);

		console.log({txid})

		if (!txid) return new Error('Error writing to contract');

		return txid;
	}

	async getAddress(keyfile) {
		return await this.arweave.wallets.getAddress(keyfile);
	}

	async generateKeyfile() {
		return await this.arweave.wallets.generate();
	}

	async deployContract(payer, {name = 'myArLog', owner = ''}) {
		const { deploy } = await import('$lib/contract/deploy.js');
		owner = owner || await this.getAddress(payer);
		contractID = await deploy({
			client: this.arweave,
			payer,
			details: {
				name,
				owner,
				latest: {
					ipfs: 'generated IPFS CID for the data',
					arweave: 'generated Arweave Tx Id for the data'
				}
			}
		}); // generate a contractID
		console.log('contractID deployed', { contractID });

		const after = await this.arweave.transactions.getStatus(contractID);
		console.log({ after }); // this will return 202

		if (after.status !== 202) return new Error('error, contract not deployed'); // TODO: handle better

		return contractID;
	}

	async list(owner) {
		// assertLoaded()
		const networkInfo = await this.arweave.network.getInfo();
		const height = networkInfo.height;

		let variables: ReqVariables = {
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

		if (transactions.edges.length < 1) return false;
		return transactions;
	}

	async getNextPage(
		arweave: Arweave,
		variables: ReqVariables
	): Promise<GQLTransactionsResultInterface> {
		const query = `query Transactions($tags: [TagFilter!]!, $owners: String!) {
                        transactions(tags: $tags, owners: [$owners]) {
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

export class Log {}
