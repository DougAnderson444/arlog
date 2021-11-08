<script>
	import { onMount, createEventDispatcher } from 'svelte';
	export let contractID;
	export let arlog;
	export let keyfile;

	const dispatch = createEventDispatcher();

	let display = '';
	let value = 'Enter new value here';

	onMount(() => {});

	async function update() {
		let latest = {};
		latest['ipfs'] = value;
		latest['arweave'] = value;
		let input = {
			function: 'Update',
			latest
		};

		const txid = await arlog.write(keyfile, contractID, input);
		console.log({ txid });
		dispatch('updated', txid);
	}
</script>

<input bind:value on:submit={update} /><button on:click={update}>Update</button>
