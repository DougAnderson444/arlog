<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { arlog } from '$lib/stores.js';

	export let contractID;
	export let keyfile;

	const dispatch = createEventDispatcher();

	let display = '';
	let value;
	let placeholder = 'Enter new value here';

	onMount(() => {});

	async function update() {
		if (!value) return;
		let latest = {};
		latest['ipfs'] = value;
		latest['arweave'] = value;
		let input = {
			function: 'Update',
			latest
		};

		const txid = await $arlog.write(keyfile, contractID, input);
		console.log({ txid });
		dispatch('updated', txid);
	}
</script>

<div>
	<input bind:value on:submit={update} {placeholder} /><button on:click={update}>Update</button>
</div>

<style>
	div {
		margin: 0.25em;
		padding: 0.25em;
	}
	input {
		width: fit-content;
	}
</style>
