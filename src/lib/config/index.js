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

export const startWeave = () => {
	return Arweave.init(liveConfig);
};

export class TestNet {
	constructor() {
		this.arweave = Arweave.init(testConfig);
	}

	init = async () => {
		// init TestWeaveSDK on the top of arweave
		const TestWeaveSDK = await import('testweave-sdk');
		this.testWeave = await TestWeaveSDK.default.init(this.arweave);
	};

	getTestKeyfile = async () => {
		if (!this.testWeave) init();

		// init TestWeaveSDK on the top of arweave
		// this.keyfile = this.testWeave.rootJWK;

		this.keyfile = await this.arweave.wallets.generate();
		const generatedAddr = await this.arweave.wallets.getAddress(this.keyfile);
		await this.testWeave.drop(generatedAddr, '123456789012');
		const generatedAddressBalance = await this.arweave.wallets.getBalance(generatedAddr); // returns 10000
		await this.testWeave.mine();
		console.log({ generatedAddressBalance });
		return this.keyfile;
	};

	doMining = async (contractID = '') => {
		if (!this.testWeave) init();

		let fin;

		// Tx seem to be one behind, maybe we need 1+ cofirmations, so add another Tx first
		const jkw = await this.arweave.wallets.generate();
		const generatedAddr = await this.arweave.wallets.getAddress(jkw);

		try {
			console.log('Mining...');
			await this.testWeave.mine(); // mine the contract
			await this.testWeave.drop(generatedAddr, '69');
			await this.testWeave.mine(); // mine the contract
			console.log('Mined!');
		} catch (error) {
			console.error(error);
			return `Error ${error}`;
		}
		try {
			if (contractID) {
				fin = await this.arweave.transactions.getStatus(contractID);
				console.log({ fin }); // this will return 202
				const result = await this.arweave.blocks.get(fin.confirmed.block_indep_hash);
				console.log({ result });
			}
		} catch (error) {
			console.error(error);
		}
	};
}
