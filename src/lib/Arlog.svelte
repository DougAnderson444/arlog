<script lang="ts">
	import Arweave from 'arweave';

	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { Tester } from './config/index.js';

	const dev = import.meta.env.DEV || false;

	let CONTRACT_ID_KEY = 'contractID';
	let KEYFILE = 'keyfile';
	let network = 'dev';
	let wallet = '';
	let value = 'Some value';
	let log, logs, loaded;
	let contractIDs = [];
	let keyfile;
	let pendingContractDeployment;

	// for testing
	let tester;

	onMount(async () => {
		// setup dev env
		tester = new Tester();
		await tester.init();

		// use dev ev to setup arlog
		log = new Arlog(tester.arweave);

		const { ImmortalDB } = await import('immortal-db');
		let savedKeyfile = await ImmortalDB.get(KEYFILE);

		// check for cached accounts
		if (savedKeyfile) keyfile = JSON.parse(savedKeyfile);
		else keyfile = tester.getTestKeyfile();

		// load the keyfile into this log
		const loadingPromise = await log.load(keyfile);
		loaded = true;

		// cache it
		await ImmortalDB.set(KEYFILE, JSON.stringify(log.keyfile));
	});

	$: loaded && showLogs();

	async function showLogs() {
		// show all logs owned by this wallet
		const logsPromise = log.getAll();
		logs = await logsPromise;
		console.log({ logs });
	}

	async function deploy() {
		pendingContractDeployment = log.deployContract();
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;
		await tester.doMining(contractDeployed);
	}
</script>

<div>
	Input something, convert it IPFS and save it to Arlog <br />
	{#if log && log.ownerAddress}
		<br />Address: {log.ownerAddress}<br /><br />
	{/if}
	{#if contractIDs && contractIDs.length > 0}
		{#each [...Object.values(contractIDs)] as contractID}
			<a href="http://localhost:1984/{contractID}/" target="_blank">{contractID} ⭷</a>
		{/each}
	{/if}

	<!-- {#if log} -->

	{#if !pendingContractDeployment}
		<button on:click={deploy}>Create new log?</button>
	{:else}
		Saving Log File to bloackchain...
	{/if}
	<div>
		<br /><input {value} /> <br />
	</div>
	<br />
	<!-- <br />
	✔️ Saving & Publishig to:
	<a href="http://localhost:1984/{contractID}/" target="_blank">Arweave Permaweb ⭷</a> -->
</div>

<style>
</style>
