<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Arlog from '$lib/Arlog.svelte';
</script>

<svelte:head>
	<title>Home</title>
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
