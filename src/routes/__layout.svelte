<!-- <script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, stuff }) {
		const url = `/blog/${page.params.slug}.json`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					article: await res.json()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script> -->
<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	import { onMount } from 'svelte';
	import ArLoad from '$lib/ArLoad.svelte';

	let mounted;
	let loaded;

	onMount(async () => {
		console.log('Layout mounted');
		mounted = true;
	});
</script>

<Header />
<main>
	{#if mounted}
		<!-- <ArLoad bind:loaded /> -->
		<!-- Otherwise the child components mount first, and there's no way to easily pass down -->
		<!-- {#if loaded} -->
		<slot />
		<!-- {/if} -->
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
