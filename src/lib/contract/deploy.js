import Arweave from 'arweave';
import { createContract } from 'smartweave';

import * as src from './append.js';
import state from './initial-state.json'; // rollup-plugin-string lets us do this in dev mode

export const deploy = async ({ client, payer, details, source = false }) => {
	if (!details.owner) throw new Error('Contract must be owned');
	state.name = details.name || 'unnamed';
	state.owner = details.owner;
	state.latest = details.latest || { ipfs: 'IPFS CID', arweave: 'Arweave Tx Id' };
	const contractSrc = source || src.default;
	// console.log({ client, payer, contractSrc, state });
	const contractTxId = await createContract(client, payer, contractSrc, JSON.stringify(state)); // Legacy

	// const contractTxId = await smartweave.createContract.deploy({
	// 	wallet: payer,
	// 	initState: JSON.stringify(state),
	// 	src: contractSrc
	// });
	console.log({ contractTxId });

	return contractTxId;
};
