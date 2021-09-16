<script lang="ts">
	import Arweave from 'arweave';

	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { Tester } from './config/index.js';
	import { readContract } from 'smartweave';

	const dev = import.meta.env.DEV || false;

	let KEYFILE = 'keyfile';
	let DB_KEYS = [KEYFILE];

	let network = 'dev';
	let wallet = '';
	let value = 'Some value';
	let log, logs, loaded;
	let contractIDs = [];
	let keyfile;
	let pendingContractDeployment;
	let resolvedBalance;

	// for testing
	let tester;
	let clearDB;
	let latest;

	onMount(async () => {
		// setup dev env
		tester = new Tester();
		await tester.init();

		// use dev env to setup arlog
		log = new Arlog(tester.arweave);

		const { ImmortalDB } = await import('immortal-db');
		let savedKeyfile = await ImmortalDB.get(KEYFILE);

		// check for cached accounts
		if (savedKeyfile) keyfile = JSON.parse(savedKeyfile);
		else keyfile = await tester.getTestKeyfile();

		// load the keyfile into this log
		const loadingPromise = await log.load(keyfile);
		loaded = true;

		// cache it
		await ImmortalDB.set(KEYFILE, JSON.stringify(log.keyfile));

		clearDB = async () => {
			console.log('Clearing', { KEYFILE });
			await ImmortalDB.remove(KEYFILE);
			console.log('Cleared', { KEYFILE });
			let savedKeyfile = await ImmortalDB.get(KEYFILE);
			console.log('savedKeyfile', { savedKeyfile });
		};
	});

	$: loaded && showLogs() && showBalance();
	$: logs && showLatest();

	$: balance = resolvedBalance;

	async function showLogs() {
		await tester.doMining(false);

		// show all logs owned by this wallet
		const logsPromise = await log.getAll();
		logs = logsPromise;

		let lasttransactionId = await log.arweave.wallets.getLastTransactionID(log.ownerAddress);
		console.log({ lasttransactionId });
	}

	async function deploy() {
		pendingContractDeployment = log.deployContract();
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;
		await tester.doMining(contractDeployed);
		showLogs();
	}
	const showBalance = async () => {
		console.log('getting balance');
		let pendingBalance = log.arweave.wallets.getBalance(log.ownerAddress);
		resolvedBalance = await pendingBalance;
		return resolvedBalance;
	};

	const showLatest = async () => {
		console.log(logs.edges);
		let latestPromise = await readContract(log.arweave, logs.edges[0].node.id);
		console.log(latestPromise);
		latest = latestPromise.latest;
	};
</script>

<div>
	Input something, convert it IPFS and save it to Arlog <br />
	{#if log && log.ownerAddress}
		<br />Paying with: {log.ownerAddress} ({balance}winstons)
		{#if clearDB}
			<button on:click={clearDB}>Delete</button>
		{/if}
		<br /><br />
	{/if}
	{#if logs && logs.edges.length > 0}
		Latest values published to Contract:
		<ul>
			{#each logs.edges as { node }}
				<li><a href="http://localhost:1984/{node.id}/" target="_blank">⭷{node.id}</a><br /></li>
			{/each}
		</ul>
		{#if latest}
			Latest values:
			{#each [...Object.entries(latest)] as [key, value]}
				<li>
					{key}:
					<a href="http://localhost:1984/{value}/" target="_blank">⭷{value}</a><br />
				</li>
			{/each}
		{/if}
	{:else if !pendingContractDeployment}
		<button on:click={deploy}>Create new log?</button>
	{:else}
		Saving Log File to blockchain...
	{/if}

	<!-- {#if log} -->

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
