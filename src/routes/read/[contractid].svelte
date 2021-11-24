<script>
	import { onMount } from 'svelte';

	import { page } from '$app/stores';
	import { arlog } from '$lib/stores.js';

	let ipfsNode;
	let CID;

	let component;
	let state;
	let contractID = $page.params.contractid;

	async function read() {
		state = await $arlog.read($page.params.contractid);
		console.log({ state });

		return state.latest;
	}
	onMount(async () => {
		// setup IPFS
		const IPFSmodule = await import('../../modules/ipfs-core/ipfs-core.js'); // doesn't incl codecs?
		// const IPFSmodule = await import('ipfs'); //electron in browser ? whaaa?
		const IPFS = IPFSmodule.default;
		CID = IPFS.CID;

		ipfsNode = await IPFS.create();

		const identity = await ipfsNode.id();
		let nodeId = identity.id;
		console.info('nodeId', nodeId);

		const readed = await read();
		console.log({ readed });

		const ret = await ipfsNode.dag.get(IPFS.CID.parse(state.ipfs));
		console.log({ ret });
		state = ret.value;
		// if (state.ipfs) window.location = `https://${state.ipfs}.ipfs.dweb.link`;
		// TODO: If state is a hostable page, or IPFS CID, redirect?
		// window.location = `https://${$page.params.contractid}/`;

		// repo.lock.getCloser().close()
		// ipfsNode.repo.close() ??
		return async () => await ipfsNode.stop(); // called when the component is unmounted to prevent lock file
	});
</script>

{#if component}
	<svelte:component this={component} {CID} {ipfsNode} />
{:else}
	{@html JSON.stringify(state)}
{/if}
