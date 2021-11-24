<script>
	import { onMount } from 'svelte';
	export let contractID;
	import { arlog, selectedNetwork } from '$lib/stores.js';
	import config from '$lib/config';

	let display = false;
	let name;
	let latest;
	let txInfos;

	onMount(async () => {
		showLog();
	});

	$: $arlog && showLog(); // trigger refreshes
	export async function showLog() {
		// Show single latest Tx
		let state = await $arlog.read(contractID);
		console.log('Reading', { state });
		name = state.name;
		latest = { ipfs: state.latest.ipfs, arweave: state.latest.arweave };
		display = state;

		// Show lo of Tx
		txInfos = await $arlog.fetchTransactions(contractID);
		console.log({ txInfos });
	}
</script>

{#if display}
	<ul>
		Latest:
		<li>Name: {name}</li>
		<li>
			IPFS: {latest.ipfs}<br />
		</li>
		<li>
			Arweave: {latest.arweave}<br />
		</li>
	</ul>
{/if}
{#if txInfos}
	{#each txInfos as { node }}
		<li>
			<a
				target="_blank"
				href="{config.networks[$selectedNetwork].protocol}://{config.networks[$selectedNetwork]
					.host}/tx/{node.id}/"
			>
				<small>{new Date(node.block.timestamp).toLocaleString()}</small></a
			>
			{JSON.parse(node.tags.find((el) => el.name === 'Input').value).latest.ipfs}
		</li>
	{/each}
{/if}
