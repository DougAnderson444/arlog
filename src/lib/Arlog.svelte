<script lang="ts">
	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { getTestKeyfile, arConfig, dev } from './config/index.js';

	let CONTRACT_ID_KEY = 'contractID';
	let KEYFILE = 'keyfile';
	let network = 'dev';
	let wallet = '';
	let value = 'Some value';
	let log, logs, loaded;
	let contractID;

	onMount(async () => {
		log = new Arlog(arConfig);
		let keyfile;
		const { ImmortalDB } = await import('immortal-db');
		let savedKeyfile = await ImmortalDB.get(KEYFILE);
		if (savedKeyfile) keyfile = JSON.parse(savedKeyfile);
		else if (dev) keyfile = await getTestKeyfile(log.arweave);
		else {
			// TODO create new production keyfile / or load from wallet
			// keyfile =
		}
		console.log({ keyfile });
		const loadingPromise = await log.load(keyfile);
		loaded = true;
		// await ImmortalDB.set(CONTRACT_ID_KEY, contractID);
		// await ImmortalDB.set(KEYFILE, JSON.stringify(log.keyfile));
	});

	$: loaded && showLogs();

	async function showLogs() {
		// show all logs owned by this wallet
		const logsPromise = log.getAll();
		logs = await logsPromise;
	}

	async function deploy() {
		log.deployContract();
	}
</script>

<div>
	Input something, convert it IPFS and save it to Arlog <br />
	{#if logs}
		{#each [...Object.entries(logs)] as l}
			<li>{l}</li>
		{/each}
	{:else}
		No prviously saved logs. <button on:click={deploy}>Create one?</button>
	{/if}
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
