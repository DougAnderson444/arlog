<script>
	import { onMount } from 'svelte';
	export let contractID;
	export let arlog;
	export let keyfile;

	let display = '';
	let value = 'Enter new value here';

	onMount(() => {});

	async function update() {
		let latest = {};
		latest['ipfs'] = 'ipfs changed to ' + value;
		latest['arweave'] = 'arweave changed to ' + value;
		let input = {
			function: 'Update',
			latest
		};

		const { result, state } = await arlog.write(keyfile, contractID, input);
		console.log({ result, state });
	}
</script>

<input bind:value on:submit={update} /><button on:click={update}>Update</button>
