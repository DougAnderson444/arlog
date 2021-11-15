<script lang="ts">
	import { onMount } from 'svelte';

	import Arlog from '$lib/arlog';
	import { startWeave, TestNet } from '$lib/config/index.js';
	import { arlog } from '$lib/stores.js';

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

	let ownerAddress = '';
	let balance = 'Loading ';

	// for testing
	let testNet;
	let clearDB;

	export let loaded;

	let load, refresh, cacheNetworkSelection, showBalance;

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
				if (!KEYFILE[selectedNetwork]) {
					KEYFILE[selectedNetwork] = await $arlog.generateKeyfile();
				}
			}

			// use dev env to setup arlog
			$arlog = new Arlog(arweaveInstance);

			await ImmortalDB.set(DB_NET_KEY[selectedNetwork], JSON.stringify(KEYFILE[selectedNetwork]));
			ownerAddress = await $arlog.getAddress(KEYFILE[selectedNetwork]);
			ownerAddress = ownerAddress;
		};

		cacheNetworkSelection = async () => {
			console.log(`caching ${selectedNetwork}`);
			if (selectedNetwork) await ImmortalDB.set(DB_SELECTED_NETWORK, selectedNetwork);
		};

		clearDB = async () => {
			await ImmortalDB.remove(DB_NET_KEY[selectedNetwork]);
			KEYFILE[selectedNetwork] = null;
		};

		await load();
		showBalance();
		loaded = true;
	});

	showBalance = async () => {
		let pendingBalance = $arlog.arweave.wallets.getBalance(ownerAddress);
		let rB = await pendingBalance;
		balance = rB;
	};

	export const listLogs = async () => {
		if (selectedNetwork == DEV_NET) await testNet.doMining();

		// show allLogs owned by this wallet
		return await $arlog.list(ownerAddress);
	};
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
			<span class="wallet">
				{selectedNetwork == DEV_NET ? '(Dev) ' : 'Live '} Payer: {ownerAddress}
				{#if balance}({balance} winstons){/if}

				{#if clearDB}
					<button on:click={clearDB}>Delete</button>
				{/if}
			</span>
			<br />
		{:else}
			<h2>Loading wallet...</h2>
		{/if}
	{:else}
		<p>ArLoading Arlog...</p>
	{/if}
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

	.wallet {
		font-size: xx-small;
	}
</style>
