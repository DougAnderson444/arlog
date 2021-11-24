<script>
	import { onMount } from 'svelte';
	import Arlog from './arlog';
	import config from './config';

	import { arlog, arLogLoaded, selectedNetwork } from './stores.js';

	const DB_SELECTED_NETWORK = 'DB_SELECTED_NETWORK';

	let dev = import.meta.env.DEV || false;
	let refresh, load;

	onMount(async () => {
		const { ImmortalDB } = await import('immortal-db');

		load = async () => {
			await cacheNetworkSelection();
			$selectedNetwork = await ImmortalDB.get(DB_SELECTED_NETWORK);
			$selectedNetwork =
				$selectedNetwork || (dev ? config.networks.DEV_NET.name : config.networks.MAIN_NET.name);

			$arlog = new Arlog({
				arweave: config.networks[$selectedNetwork]
			});
		};

		await load();
		$arLogLoaded = true;

		refresh = async () => {
			if ($arlog) await $arlog.mine();
		};

		async function cacheNetworkSelection() {
			console.log(`caching ${$selectedNetwork}`);
			if ($selectedNetwork) await ImmortalDB.set(DB_SELECTED_NETWORK, $selectedNetwork);
		}
	});
</script>

<header>
	<div class="corner">
		<!-- Left Corner -->
	</div>
	<div class="corner">
		<select bind:value={$selectedNetwork} on:change={load}>
			{#each [...Object.entries(config.networks)] as [key, { name }]}
				<option value={key} selected={$selectedNetwork == key}>{key}</option>
			{/each}
		</select>
	</div>
</header>

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
