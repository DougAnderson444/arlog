<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	import { onMount } from 'svelte';
	import ArLoad from '$lib/ArLoad.svelte';
	import { arLogLoaded, portal } from '$lib/stores.js';
	import Portal from '../../../iframe-wallet/src/lib/Portal.svelte';

	let mounted;

	onMount(async () => {
		mounted = true;
	});
</script>

<Portal bind:portal={$portal} />

<Header />

<main>
	{#if mounted}
		<!-- Otherwise the child components mount first, and there's no way to easily pass down -->
		<ArLoad />
		{#if $arLogLoaded}
			<slot />
		{/if}
	{/if}
</main>

<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
