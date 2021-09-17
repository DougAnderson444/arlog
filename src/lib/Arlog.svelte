<script lang="ts">
	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { startWeave, TestNet } from './config/index.js';
	import ReadContract from './ReadContract.svelte';
	import UpdateLog from './UpdateLog.svelte';

	let dev: boolean = import.meta.env.DEV || false;
	const LIVE_NET: string = 'LIVE_NET';
	const DEV_NET: string = 'DEV_NET';
	let selectedNetwork = dev ? DEV_NET : LIVE_NET;

	let KEYFILE = {
		DEV_NET: '',
		LIVE_NET: ''
	};

	let DB_KEY = {
		DEV_NET,
		LIVE_NET
	};

	let arlog, allLogs, loaded;
	let contractIDs = [];
	let pendingContractDeployment;
	let ownerAddress = '';
	let resolvedBalance;
	let balance = 'Loading ';

	// for testing
	let testNet;
	let clearDB, load;

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');

		load = async () => {
			console.log(`loading ${selectedNetwork}`);

			let arweaveInstance;

			let savedKeyfile = await ImmortalDB.get(DB_KEY[selectedNetwork]);
			if (savedKeyfile) KEYFILE[selectedNetwork] = JSON.parse(savedKeyfile);

			if (selectedNetwork == DEV_NET) {
				testNet = new TestNet();
				await testNet.init();

				arweaveInstance = testNet.arweave;
				if (!KEYFILE[selectedNetwork]) KEYFILE[selectedNetwork] = await testNet.getTestKeyfile();
			} else {
				arweaveInstance = startWeave();
				if (!KEYFILE[selectedNetwork]) {
					KEYFILE[selectedNetwork] = await arlog.generateKeyfile();
				}
				console.log(`live keyfile ${KEYFILE[selectedNetwork]}`);
			}

			// use dev env to setup arlog
			arlog = new Arlog(arweaveInstance);

			await ImmortalDB.set(DB_KEY[selectedNetwork], JSON.stringify(KEYFILE[selectedNetwork]));
			ownerAddress = await arlog.getAddress(KEYFILE[selectedNetwork]);
			ownerAddress = ownerAddress;
			console.log(`ownerAddress ${ownerAddress}`);
		};

		clearDB = async () => {
			await ImmortalDB.remove(DB_KEY[selectedNetwork]);
			KEYFILE[selectedNetwork] = null;
		};

		await load();
		loaded = true;
	});

	$: loaded && showLogs() && showBalance(); // show logs and balance after loaded

	async function showLogs() {
		await testNet.doMining();

		// show allLogs owned by this wallet
		const logsPromise = await arlog.list(ownerAddress);
		allLogs = logsPromise;
	}

	const showBalance = async () => {
		let pendingBalance = arlog.arweave.wallets.getBalance(ownerAddress);
		let rB = await pendingBalance;
		balance = rB;
	};

	async function createNewLog() {
		pendingContractDeployment = arlog.createNewLog(KEYFILE[selectedNetwork]);
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;
		await testNet.doMining(contractDeployed);
		showLogs();
	}
</script>

<header>
	<div class="corner">
		<!-- Left Corner -->
	</div>
	<div class="corner">
		<select bind:value={selectedNetwork} on:change={load}>
			<option value={DEV_NET}>Dev</option>
			<option value={LIVE_NET}>Live</option>
		</select>
	</div>
</header>
<div>
	{#if arlog}
		{#if ownerAddress}
			<h2>
				{selectedNetwork == DEV_NET ? '(Dev) ' : 'Live '}Keyfile: {ownerAddress} ({balance} winstons)
			</h2>
			{#if clearDB}
				<button on:click={clearDB}>Delete</button>
			{/if}
			<br />
		{:else}
			<h2>Loading wallet...</h2>
		{/if}

		<h2>List all owner contracts (ownerAddress)</h2>
		{#if allLogs && allLogs.edges && allLogs.edges.length > 0}
			{#each allLogs.edges as { node }}
				<li><a href="http://localhost:1984/{node.id}/" target="_blank">⭷{node.id}</a><br /></li>
				<ReadContract contractID={node.id} {arlog} /><br />
				- Update this log: <UpdateLog
					contractID={node.id}
					{arlog}
					keyfile={KEYFILE[selectedNetwork]}
				/>
			{/each}
		{:else if !pendingContractDeployment && KEYFILE[selectedNetwork]}
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
	header {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.corner {
		width: 10em;
		height: 3em;
		text-align: center;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}
</style>
