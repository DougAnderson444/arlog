import Arweave from 'arweave';
import { createContract } from 'smartweave';

import * as src from './append.js';
import state from './initial-state.json'; // rollup-plugin-string lets us do this in dev mode

export const deploy = async ({
	client,
	payer,
	owner,
	latest = { ipfs: 'IPFS CID', arweave: 'Arweave Tx Id' } // optional init balance, else random owner amt
}) => {
	state.name = name;
	state.owner = owner;
	state.latest = latest; // { ipfs, arweave }
	const source = src.default;
	console.log({ client, payer, source, state });
	const id = await createContract(client, payer, source, JSON.stringify(state));
	return id;
};
