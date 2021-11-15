import preprocess from 'svelte-preprocess';
import { string as moduleToString } from 'rollup-plugin-string';
import adapter_ipfs from 'sveltejs-adapter-ipfs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter_ipfs({
			removeBuiltInServiceWorkerRegistration: true,
			injectPagesInServiceWorker: true
		}),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			plugins: [
				moduleToString({
					// Required to be specified
					include: '**/append.js'
				})
			],
			server: {
				fs: {
					// Allow serving files from levels up to the project root
					allow: ['../../../']
				}
			}
		}
	}
};

export default config;
