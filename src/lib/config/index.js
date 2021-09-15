// dev/production config helpers

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

export const dev = import.meta.env.DEV || false;
export const arConfig = dev ? testConfig : liveConfig;

export const getTestKeyfile = async (arweave) => {
	if (dev) {
		// init TestWeaveSDK on the top of arweave
		const TestWeaveSDK = await import('testweave-sdk');
		let testWeave = await TestWeaveSDK.default.init(arweave);
		return testWeave.rootJWK;
	}

	throw new Error('Not is development environment, use a wallet');
};
