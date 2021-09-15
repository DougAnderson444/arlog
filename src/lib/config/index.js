// dev/production config helpers
import Arweave from 'arweave';

const testConfig = {
	host: 'localhost',
	port: 1984,
	protocol: 'http',
	timeout: 20000,
	logging: false
};
export const liveConfig = {
	host: 'arweave.net'
};

export class Tester {
	constructor() {
		this.arweave = Arweave.init(testConfig);
	}

	init = async () => {
		// init TestWeaveSDK on the top of arweave
		const TestWeaveSDK = await import('testweave-sdk');
		this.testWeave = await TestWeaveSDK.default.init(this.arweave);
	};

	getTestKeyfile = () => {
		if (!this.testWeave) init();

		// init TestWeaveSDK on the top of arweave
		this.keyfile = this.testWeave.rootJWK;
		return this.keyfile;
	};

	doMining = async (contractID) => {
		if (!this.testWeave) init();

		let fin;

		try {
			console.log('Mining...');
			await this.testWeave.mine(); // mine the contract
			await this.testWeave.mine(); // mine the contract
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
	};
}
