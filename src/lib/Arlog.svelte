<script lang="ts">
	import { onMount } from 'svelte';
	import config from '$lib/config';

	import { arlog, arLogLoaded, portal, selectedNetwork } from '$lib/stores.js';

	let dev: boolean = import.meta.env.DEV || true; //false;
	const LIVE_NET: string = 'LIVE_NET';
	const DEV_NET: string = 'DEV_NET';

	let allLogs;
	let contractIDs = [];
	let pendingContractDeployment;
	let ownerAddress;
	let balance;

	// for testing
	let testNet;
	let refresh;
	let configArweaveWallet;

	$: if ($portal && $arLogLoaded && configArweaveWallet) configArweaveWallet();

	onMount(async () => {
		configArweaveWallet = async () => {
			// connection request, ArConnect API
			await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION'], {
				name: 'ArLog' // optional application name
			});
			ownerAddress = await window.arweaveWallet.getActiveAddress();
			refresh();
		};
		refresh = () => {
			showBalance();
			showLogs();
		};
	});

	async function showLogs() {
		if ($selectedNetwork !== config.networks.MAIN_NET.name) await $arlog.doMining();

		// show allLogs owned by this wallet
		const logsPromise = await $arlog.list(ownerAddress);
		allLogs = logsPromise;
		console.log('logs refresh to', { allLogs });
	}

	async function showBalance() {
		let pendingBalance = $arlog.arweave.wallets.getBalance(ownerAddress);
		let rB = await pendingBalance;
		balance = rB;
		if (testNet && balance < 1000) {
			await testNet.airDrop(ownerAddress);
			refresh();
		}
	}

	async function createNewLog() {
		pendingContractDeployment = $arlog.createNewLog('use_wallet');
		const contractDeployed = await pendingContractDeployment;
		contractIDs = [...contractIDs, contractDeployed];
		pendingContractDeployment = false;

		showLogs();
	}
</script>

<div>
	{#if $arlog}
		<h2>All ArLogs owned by ({ownerAddress})</h2>
		{#if allLogs && allLogs.edges && allLogs.edges.length > 0}
			{#each allLogs.edges as { node }}
				<li>Read: <a href="/read/{node.id}/">⭷ {node.id}</a></li>
				<li>Read-Write: <a href="/readwrite/{node.id}/">⭷ {node.id}</a></li>
			{/each}
		{:else if !pendingContractDeployment}
			<button on:click={createNewLog}>No logs. Create one?</button>
		{:else}
			Creating your Log on the blockchain...
		{/if}
	{:else}
		<p>Log Loading Arlog...</p>
	{/if}
</div>
