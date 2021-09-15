import preprocess from 'svelte-preprocess';
import { string as moduleToString } from 'rollup-plugin-string';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			plugins: [
				moduleToString({
					// Required to be specified
					include: '**/append.js'
				})
			]
		}
	}
};

export default config;
