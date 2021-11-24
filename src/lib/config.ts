async function init(arlog) {
	const TestWeaveSDK = await import('testweave-sdk');
	// console.log({ TestWeaveSDK });
	// {
	//   TestWeaveSDK: [Module: null prototype] {
	//     __esModule: true,
	//     default: { default: [Function] }
	//   }
	// }
	let testWeave;
	try {
		testWeave = await TestWeaveSDK.init(arlog.arweave); // TODO default import issue?
	} catch (error) {
		// console.warn(error);
		try {
			testWeave = await TestWeaveSDK.default.init(arlog.arweave); // TODO default import issue?
		} catch (error) {
			// console.warn(error);
			try {
				testWeave = await TestWeaveSDK.default.default.init(arlog.arweave); // TODO default import issue?
			} catch (error) {
				console.warn(error);
			}
		}
	}

	return testWeave;
}
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
			mine: async (arlog) => {
				console.log('Mining...');
				const testWeave = await init(arlog);
				await testWeave.mine();
				console.log('Mined!');
			},
			drop: async (arlog, address, amt = '1234567890123') => {
				const testWeave = await init(arlog);
				return await testWeave.drop(address, amt);
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
