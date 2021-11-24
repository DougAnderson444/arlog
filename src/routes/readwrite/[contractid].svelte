<script>
	import { onMount } from 'svelte';

	import { getStores, navigating, page, session } from '$app/stores';
	import { arlog, selectedNetwork } from '$lib/stores.js';
	import config from '$lib/config';
	import ReadContract from '$lib/ReadContract.svelte';
	import UpdateLog from '$lib/UpdateLog.svelte';

	let component;
	let state;
	let contractID = $page.params.contractid;
	let refresh;
	let reader;

	async function read() {
		state = await $arlog.read($page.params.contractid);
		console.log({ state });
	}
	onMount(() => {
		read();
		// window.location = `https://${$page.params.contractid}/`;

		refresh = async () => {
			if ($selectedNetwork !== config.networks.MAIN_NET.name) await $arlog.doMining();
			reader.showLog(); // force refresh
		};
	});
</script>

{#if component}
	<svelte:component this={component} />
{:else}
	Contract: <a
		href="{config.networks[$selectedNetwork].protocol}://{config.networks[$selectedNetwork]
			.host}/tx/{$page.params.contractid}">{$page.params.contractid}</a
	>
	<br />

	<UpdateLog {contractID} keyfile={'use_wallet'} on:updated={refresh} />
	<ReadContract bind:contractID bind:this={reader} /><br />
{/if}
