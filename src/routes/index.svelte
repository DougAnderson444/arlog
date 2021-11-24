<script lang="ts">
	import Arlog from '$lib/Arlog.svelte';

	import { onMount } from 'svelte';

	let mounted;
	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Home</title>
	<script>
		global = globalThis; // for solana web3 repo
	</script>
</svelte:head>

<section>
	<h1>Arlog Demo</h1>
	<Arlog />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}
</style>
