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

	const DB_NET_KEY = {
		DEV_NET,
		LIVE_NET
	};

	const DB_SELECTED_NETWORK = 'DB_SELECTED_NETWORK';

	let arlog, allLogs;
	let arLogLoaded;
	let contractIDs = [];
	let pendingContractDeployment;
	let ownerAddress;
	let resolvedBalance;
	let balance;

	// for testing
	let testNet;
	let load, refresh, cacheNetworkSelection;
	let configArweaveWallet;
	export let portal;

	$: if (portal && arLogLoaded && configArweaveWallet) configArweaveWallet();

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');

		configArweaveWallet = async () => {
			// connection request, ArConnect API
			await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION'], {
				name: 'ArLog' // optional application name
			});
			ownerAddress = await window.arweaveWallet.getActiveAddress();
			refresh();
		};

		load = async () => {
			if (!window.arweaveWallet) {
				alert('No Arweave Wallet available (yet?)');
				return;
			}

			await cacheNetworkSelection();
			selectedNetwork = await ImmortalDB.get(DB_SELECTED_NETWORK);
			selectedNetwork = selectedNetwork || (dev ? DEV_NET : LIVE_NET);

			let arweaveInstance;

			if (selectedNetwork == DEV_NET) {
				testNet = new TestNet();
				await testNet.init();
			}

			arweaveInstance = testNet ? testNet.arweave : startWeave();
			console.log({ arweaveInstance });
			// use dev env to setup arlog
			arlog = new Arlog(arweaveInstance);
			console.log({ arlog });
		};

		cacheNetworkSelection = async () => {
			console.log(`caching ${selectedNetwork}`);
			if (selectedNetwork) await ImmortalDB.set(DB_SELECTED_NETWORK, selectedNetwork);
		};

		refresh = () => {
			showBalance();
			showLogs();
		};

		await load();
		arLogLoaded = true;
	});

	async function showLogs() {
		if (selectedNetwork == DEV_NET) await testNet.doMining();

		// show allLogs owned by this wallet
		const logsPromise = await arlog.list(ownerAddress);
		allLogs = logsPromise;
		console.log('logs refresh to', { allLogs });
	}

	async function showBalance() {
		let pendingBalance = arlog.arweave.wallets.getBalance(ownerAddress);
		let rB = await pendingBalance;
		balance = rB;
		if (testNet && balance < 1000) {
			await testNet.airDrop(ownerAddress);
			refresh();
		}
	}

	async function createNewLog() {
		pendingContractDeployment = arlog.createNewLog('use_wallet');
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
			<br />
		{:else}
			<h2>Loading wallet...</h2>
		{/if}

		<h2>List all owner contracts ({ownerAddress})</h2>
		{#if allLogs && allLogs.edges && allLogs.edges.length > 0}
			{#each allLogs.edges as { node }}
				<li>
					Contract Initial State:<a
						href="http://localhost:1984/{node.id}/"
						target="_blank"
						rel="external">⭷{node.id}</a
					><br />View user data:<a href="/user/{node.id}/">⭷{node.id}</a><br />
				</li>
				<br />
				Contract Final State (rendered in browser):
				<ReadContract contractID={node.id} {arlog} /><br />
				<UpdateLog contractID={node.id} {arlog} keyfile={'use_wallet'} on:updated={refresh} />
			{/each}
		{:else if !pendingContractDeployment}
			<button on:click={createNewLog}>No logs. Create one?</button>
		{:else}
			Creating your Log on the blockchain...
		{/if}
	{:else}
		<p>Log Loading Arlog...</p>
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
