import Arlog from '$lib/arlog';
import { startWeave, TestNet } from '$lib/config/index.js';

let dev = import.meta.env.DEV || true; // false; // TODO: remember to switch back after testig complete
let arweaveInstance;
let arlog;

const init = async () => {
	if (dev) {
		console.log('Dev env');
		let testNet = new TestNet();
		await testNet.init();
		arweaveInstance = testNet.arweave;
	} else {
		console.log('Production env');
		arweaveInstance = startWeave();
	}
	arlog = new Arlog(arweaveInstance);
};

let promisedInit = init();

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js
	const { contractid } = params;

	if (!arlog) await promisedInit;

	const contractState = await arlog.read(contractid);

	if (contractState) {
		return {
			// status, // For successful responses, SvelteKit will generate 304s automatically.
			// headers,
			body: {
				// body is automatically turned into JSON response if A) body is an object, and B) no content-type header is returned
				...contractState // spread out
			}
		};
	}
	// Returning nothing is equivalent to an explicit 404 response.
}
