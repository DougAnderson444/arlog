import { get } from 'svelte/store';
import { arlog } from '$lib/stores.js';
var testweave;

const init = async () => {
	// init TestWeaveSDK on the top of arweave
	const TestWeaveSDK = await import('testweave-sdk');
	try {
		testWeave = await TestWeaveSDK.init(get(arlog).arweave); // TODO default import issue?
	} catch (error) {
		console.warn(error);
	}
	try {
		testWeave = await TestWeaveSDK.default.init(get(arlog).arweave); // TODO default import issue?
	} catch (error) {
		console.warn(error);
	}
};
let loading;
if (get(arlog)) loading = init();

export default {
	networks: {
		DEV_NET: {
			host: 'arweave.run',
			port: 443,
			protocol: 'https',
			timeout: 20000,
			logging: false,
			name: 'DEV_NET',
			mine: async () => {
				await fetch('https://arweave.run/mine');
			}
		},

		LOCAL_TEST_NET: {
			host: 'localhost',
			port: 1984,
			protocol: 'http',
			timeout: 20000,
			logging: false,
			name: 'LOCAL_TEST_NET',
			mine: async () => {
				await loading;
				await testWeave.mine();
			}
		},

		REDSTONE_NET: {
			host: 'dh48zl0solow5.cloudfront.net',
			port: 443,
			protocol: 'https',
			timeout: 20000,
			logging: false,
			name: 'REDSTONE_NET',
			mine: async () => {
				await fetch('https://dh48zl0solow5.cloudfront.net/mine');
			}
		},

		MAIN_NET: {
			host: 'arweave.net',
			port: 443,
			protocol: 'https',
			name: 'MAIN_NET'
		}
	}
};

export const MAX_REQUEST = 100;
