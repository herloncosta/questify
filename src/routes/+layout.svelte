<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/logo.png';
	import { getTheme } from '$lib/stores/theme.svelte.js';

	let { children } = $props();

	const theme = $derived(getTheme());

	$effect(() => {
		document.documentElement.classList.toggle('light', theme === 'light');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
