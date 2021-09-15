<script lang="ts">
	import { onMount } from 'svelte';
	import { ImmortalDB } from 'immortal-db';

	import Arlog from './arlog';

	let CONTRACT_ID_KEY = 'contractID';
	let network = 'dev';
	let wallet = '';
	let value = 'Some value';
	let log;
	let contractID;

	onMount(async () => {
		log = new Arlog();
		// can I show all logs saved by this wallet?
		const prev = await ImmortalDB.get(CONTRACT_ID_KEY);
		contractID = prev || (await log.load()); // blank = creates a new log
		await ImmortalDB.set(CONTRACT_ID_KEY, contractID);
	});
</script>

<div>
	Input something, convert it IPFS and save it to Arlog <br />
	<div>
		<br /><input {value} /> <br />
	</div>
	<br />
	<br />
	✔️ Saving & Publishig to:
	<a href="http://localhost:1984/{contractID}/" target="_blank">Arweave Permaweb ⭷</a>
</div>

<style>
</style>
