<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Arlog from '$lib/Arlog.svelte';
	import Portal from '../../../iframe-wallet/src/lib/Portal.svelte';

	import { onMount } from 'svelte';

	let portal;

	let mounted;
	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<!-- can go anywhere, its fixed position in upper right hand corner -->
<Portal bind:portal />

{#if portal}
	<section>
		<h1>Arlog Demo</h1>
		<Arlog {portal} />
	</section>
{/if}

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
