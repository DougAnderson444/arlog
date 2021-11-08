<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch }) {
		const url = `/user/${page.params.contractid}.json`; // ?network=${page.query.get('network')}
		const res = await fetch(url);

		if (res.ok) {
			let contractState = await res.json();

			if (contractState.latest.ipfs) {
				console.log('redirect to', `https://cloudflare-ipfs.com/ipfs/${contractState.latest.ipfs}`);
				return {
					status: 304, // Not Modified status  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304,
					redirect: `https://cloudflare-ipfs.com/ipfs/${contractState.latest.ipfs}`
				};
			}

			return {
				props: {
					contractState,
					contractid: page.params.contractid
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script>
	// looks up the SmartWeave value of the slug

	import { onMount } from 'svelte';

	import { getStores, navigating, page, session } from '$app/stores';

	import { arlog } from '$lib/stores.js';

	export let contractState;

	console.log({ contractState });

	let contractID = $page.params.contractid;
	let latest;

	onMount(async () => {
		// let state = await $arlog.read(contractID);
		// name = contractState.name;
		latest = { ipfs: contractState.latest.ipfs, arweave: contractState.latest.arweave };
		// display = state;
	});
</script>

contractID: {contractID} <br />
{#if latest}
	latest ipfs:{latest?.ipfs}
{/if}
