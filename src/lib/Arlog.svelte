<script lang="ts">
	import Arweave from 'arweave';

	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { Tester } from './config/index.js';
	import { readContract } from 'smartweave';
	import ReadContract from './ReadContract.svelte';
	import UpdateLog from './UpdateLog.svelte';

	const dev = import.meta.env.DEV || false;

	let KEYFILE = 'keyfile';
	let DB_KEYS = [KEYFILE];

	let network = 'dev';
	let wallet = '';
	let value = 'Some value';
	let arlog, allLogs, loaded;
	let contractIDs = [];
	let keyfile;
	let pendingContractDeployment;
	let resolvedBalance;

	// for testing
	let tester;
	let clearDB;
	let ownerAddress = '';

	onMount(async () => {
		// setup dev env
		tester = new Tester();
		await tester.init();

		// use dev env to setup arlog
		arlog = new Arlog(tester.arweave);

		const { ImmortalDB } = await import('immortal-db');
		let savedKeyfile = await ImmortalDB.get(KEYFILE);

		// check for cached accounts
		if (savedKeyfile) keyfile = JSON.parse(savedKeyfile);
		else keyfile = await tester.getTestKeyfile();

		// cache it
		await ImmortalDB.set(KEYFILE, JSON.stringify(keyfile));

		ownerAddress = await arlog.getAddress(keyfile);

		loaded = true;

		clearDB = async () => {
			await ImmortalDB.remove(KEYFILE);
			let savedKeyfile = await ImmortalDB.get(KEYFILE);
		};
	});

	$: loaded && showLogs() && showBalance();

	$: balance = resolvedBalance;

	async function showLogs() {
		await tester.doMining();

		// show allLogs owned by this wallet
		const logsPromise = await arlog.list(ownerAddress);
		allLogs = logsPromise;
	}

	async function createNewLog() {
		pendingContractDeployment = arlog.createNewLog(keyfile);
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;
		await tester.doMining(contractDeployed);
		showLogs();
	}
	const showBalance = async () => {
		let pendingBalance = arlog.arweave.wallets.getBalance(ownerAddress);
		resolvedBalance = await pendingBalance;
		return resolvedBalance;
	};
</script>

<div>
	{#if arlog}
		{#if ownerAddress}
			<h2>Loaded Keyfile:<br /> {ownerAddress}<br /> ({balance}winstons)</h2>
			<!-- {#if clearDB}
				<button on:click={clearDB}>Delete</button>
			{/if} -->
			<br />
		{:else}
			<h2>Loading wallet...</h2>
		{/if}

		<h2>List all owner contracts (ownerAddress)</h2>
		{#if allLogs && allLogs.edges && allLogs.edges.length > 0}
			{#each allLogs.edges as { node }}
				<li><a href="http://localhost:1984/{node.id}/" target="_blank">⭷{node.id}</a><br /></li>
				<ReadContract contractID={node.id} {arlog} /><br />
				- Update this log: <UpdateLog contractID={node.id} {arlog} {keyfile} />
			{/each}
		{:else if !pendingContractDeployment && keyfile}
			<button on:click={createNewLog}>No logs. Create one?</button>
		{:else}
			Creating your Log on the blockchain...
		{/if}
	{:else}
		<p>Loading Arlog...</p>
	{/if}

	<!-- {#if log} -->
	<!-- <br />
	✔️ Saving & Publishig to:
	<a href="http://localhost:1984/{contractID}/" target="_blank">Arweave Permaweb ⭷</a> -->
</div>

<style>
</style>
