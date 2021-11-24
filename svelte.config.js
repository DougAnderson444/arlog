import preprocess from 'svelte-preprocess';
import { string as moduleToString } from 'rollup-plugin-string';
import adapter_ipfs from 'sveltejs-adapter-ipfs';
import mm from 'micromatch';

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
		// for building the library so others can import it
		package: {
			dir: 'dist',
			exports: (filepath) => {
				if (filepath.endsWith('.d.ts')) return false;
				// if (filepath == '.') return ?
				return mm.isMatch(filepath, ['!**/_*', '!**/internal/**']);
			},
			files: mm.matcher('!**/build.*')
		},

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
