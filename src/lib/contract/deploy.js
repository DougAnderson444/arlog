import Arweave from 'arweave';
import { createContract } from 'smartweave';

import * as src from './append.js';
import state from './initial-state.json'; // rollup-plugin-string lets us do this in dev mode

export const deploy = async ({ client, payer, details }) => {
	if (!details.owner) throw new Error('Contract must be owned');
	state.name = details.name || 'unnamed';
	state.owner = details.owner;
	state.latest = details.latest || { ipfs: 'IPFS CID', arweave: 'Arweave Tx Id' };
	const source = src.default;
	console.log({ client, payer, source, state });
	const id = await createContract(client, payer, source, JSON.stringify(state));
	return id;
};
