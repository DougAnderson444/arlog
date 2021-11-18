import { readContract, interactWrite, createContract } from 'smartweave';

export class SmartweaveFactory {
	constructor(config) {
		this.arweave = config.arweave;
	}

	async read(contractID: string) {
		// Legacy
		const state = await readContract(this.arweave, contractID);
		return state;
	}
}
