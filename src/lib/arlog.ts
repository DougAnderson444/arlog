import Arweave from 'arweave';
import { CONTRACT_ID, APP_WALLET } from '$lib/utils/constants';

const testConfig = {
	host: 'localhost',
	port: 1984,
	protocol: 'http',
	timeout: 20000,
	logging: false
};
const liveConfig = {
	host: 'arweave.net'
};

let dev = import.meta.env.DEV || false;
let arConfig = dev ? testConfig : liveConfig;
let arweave;
let keyfile;
let ownerAddress;

let contractID = !dev && CONTRACT_ID;

export default class Arlog {
	constructor(client?: Arweave) {
		this.arweave = client || Arweave.init(arConfig);
	}

	async load() {
		// wallet?: keyfile, logID?: String

		if (dev) {
			// init TestWeaveSDK on the top of arweave
			const TestWeaveSDK = await import('testweave-sdk');
			let testWeave = await TestWeaveSDK.default.init(this.arweave);
			keyfile = testWeave.rootJWK;
			ownerAddress = await this.arweave.wallets.getAddress(keyfile);

			const { deploy } = await import('$lib/contract/deploy.js');
			contractID = await deploy({ client: this.arweave, payer: keyfile, owner: ownerAddress }); // generate a testWeave contractID
			console.log('contractID deployed', { contractID });

			const after = await this.arweave.transactions.getStatus(contractID);
			console.log({ after }); // this will return 202

			if (after.status !== 202) new Error('error, contract not deployed'); // TODO: handle better
			
			let fin

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
				console.log(fin.confirmed.block_indep_hash)
				const result = await this.arweave.blocks.get(fin.confirmed.block_indep_hash); 
				console.log({result})
			} catch (error) {
				console.error(error)
			}
			return contractID;
		}
	}
}
