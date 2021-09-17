<script>
	import { onMount } from 'svelte';
	export let contractID;
	export let arlog;

	let display = false;
	let name;
	let latest;

	onMount(async () => {
		let state = await arlog.read(contractID);
		name = state.name;
		latest = { ipfs: state.latest.ipfs, arweave: state.latest.arweave };
		display = state;
	});
</script>

{#if display}
	<ul>
		<li>Name: {name}</li>
		<li>
			IPFS: {latest.ipfs}<br />
		</li>
		<li>
			Arweave: {latest.arweave}<br />
		</li>
	</ul>
{/if}
