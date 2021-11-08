<script lang="ts">
	import { onMount } from 'svelte';

	import Arlog from './arlog';
	import { startWeave, TestNet } from './config/index.js';
	import ReadContract from './ReadContract.svelte';
	import UpdateLog from './UpdateLog.svelte';

	let dev: boolean = import.meta.env.DEV || true; //false;
	const LIVE_NET: string = 'LIVE_NET';
	const DEV_NET: string = 'DEV_NET';
	let selectedNetwork;

	let KEYFILE = {
		DEV_NET: '',
		LIVE_NET: ''
	};

	const DB_NET_KEY = {
		DEV_NET,
		LIVE_NET
	};

	const DB_SELECTED_NETWORK = 'DB_SELECTED_NETWORK';

	let arlog, allLogs;
	let loaded;
	let contractIDs = [];
	let pendingContractDeployment;
	let ownerAddress = '';
	let resolvedBalance;
	let balance = 'Loading ';
	let showBalance;

	// for testing
	let testNet;
	let clearDB, load, refresh, cacheNetworkSelection;

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');

		load = async () => {
			await cacheNetworkSelection();
			selectedNetwork = await ImmortalDB.get(DB_SELECTED_NETWORK);
			selectedNetwork = selectedNetwork || (dev ? DEV_NET : LIVE_NET);

			let arweaveInstance;

			let savedKeyfile = await ImmortalDB.get(DB_NET_KEY[selectedNetwork]);
			if (savedKeyfile) KEYFILE[selectedNetwork] = JSON.parse(savedKeyfile);

			if (selectedNetwork == DEV_NET) {
				testNet = new TestNet();
				await testNet.init();

				arweaveInstance = testNet.arweave;
				console.log({ selectedNetwork });
				if (!KEYFILE[selectedNetwork]) KEYFILE[selectedNetwork] = await testNet.getTestKeyfile();
			} else {
				arweaveInstance = startWeave();
				if (window.arweaveWallet) {
					await window.arweaveWallet.connect(['ACCESS_ADDRESS'], {
						name: 'ArLog' // optional application name
					});
					window.addEventListener('arweaveWalletLoaded', async () => {
						/** Handle ArConnect load event **/
						ownerAddress = await window.arweaveWallet.getActiveAddress();
					});
				} else if (!KEYFILE[selectedNetwork]) {
					KEYFILE[selectedNetwork] = await arlog.generateKeyfile();
				}
			}

			// use dev env to setup arlog
			arlog = new Arlog(arweaveInstance);

			await ImmortalDB.set(DB_NET_KEY[selectedNetwork], JSON.stringify(KEYFILE[selectedNetwork]));
			ownerAddress = ownerAddress || (await arlog.getAddress(KEYFILE[selectedNetwork]));
			ownerAddress = ownerAddress;
			refresh();
		};

		cacheNetworkSelection = async () => {
			console.log(`caching ${selectedNetwork}`);
			if (selectedNetwork) await ImmortalDB.set(DB_SELECTED_NETWORK, selectedNetwork);
		};

		refresh = () => {
			showBalance();
			showLogs();
		};

		clearDB = async () => {
			await ImmortalDB.remove(DB_NET_KEY[selectedNetwork]);
			KEYFILE[selectedNetwork] = null;
		};

		await load();
		loaded = true;
	});

	async function showLogs() {
		if (selectedNetwork == DEV_NET) await testNet.doMining();

		// show allLogs owned by this wallet
		const logsPromise = await arlog.list(ownerAddress);
		allLogs = logsPromise;
		console.log('logs refresh to', { allLogs });
	}

	showBalance = async () => {
		let pendingBalance = arlog.arweave.wallets.getBalance(ownerAddress);
		let rB = await pendingBalance;
		balance = rB;
	};

	async function createNewLog() {
		console.log(KEYFILE[selectedNetwork]);
		pendingContractDeployment = arlog.createNewLog(KEYFILE[selectedNetwork]);
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;

		showLogs();
	}
</script>

<header>
	<div class="corner">
		<!-- Left Corner -->
	</div>
	<div class="corner">
		<select bind:value={selectedNetwork} on:change={load}>
			{#if dev}
				<option value={null} selected={!selectedNetwork}>Select Network</option>
				<option value={DEV_NET}>Dev</option>
			{/if}
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
				<li>
					Contract Initial State:<a href="http://localhost:1984/{node.id}/" target="_blank"
						>⭷{node.id}</a
					><br />View user data:<a href="/user/{node.id}/">⭷{node.id}</a><br />
				</li>
				<br />
				Contract Final State (rendered in browser):
				<ReadContract contractID={node.id} {arlog} /><br />
				<UpdateLog
					contractID={node.id}
					{arlog}
					keyfile={KEYFILE[selectedNetwork]}
					on:updated={refresh}
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
</style>
