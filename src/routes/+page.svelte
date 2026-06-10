<script lang="ts">
	import type { View } from '$lib/types';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Gamification from '$lib/components/Gamification.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import TodoList from '$lib/components/TodoList.svelte';
	import Pomodoro from '$lib/components/Pomodoro.svelte';
	import Kanban from '$lib/components/Kanban.svelte';
	import Notes from '$lib/components/Notes.svelte';
	import Diagrams from '$lib/components/Diagrams.svelte';
	import Map from '$lib/components/Map.svelte';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	let currentView = $state<View>('dashboard');
	let mobileOpen = $state(false);
	let collapsed = $state(false);
	let isMobile = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(max-width: 767px)');
		isMobile = mq.matches;
		const onChange = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
			if (e.matches && currentView === 'diagrams') currentView = 'dashboard';
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	$effect(() => {
		if (isMobile && currentView === 'diagrams') currentView = 'dashboard';
	});
</script>

<div class="flex min-h-screen">
	<button
		class:cursor-pointer={true}
		onclick={() => (mobileOpen = !mobileOpen)}
		class="fixed top-3 right-3 z-50 flex h-8 w-8 items-center justify-center border border-surface-3 bg-surface-2 text-text-primary md:hidden"
		aria-label="Toggle menu"
	>
		{#if mobileOpen}
			<X class="h-4 w-4" />
		{:else}
			<Menu class="h-4 w-4" />
		{/if}
	</button>

	<Sidebar bind:current={currentView} bind:mobileOpen bind:collapsed {isMobile} />
	<Gamification />

	<main
		class="flex-1 px-4 transition-all duration-200 md:px-8 {collapsed
			? 'md:ml-16'
			: 'md:ml-56'} {currentView === 'diagrams' || currentView === 'map'
			? 'flex flex-col py-4 md:py-8'
			: 'py-16 md:py-8'}"
	>
		{#key currentView}
			<div
				class={currentView === 'diagrams' || currentView === 'map' ? 'flex flex-1 flex-col' : ''}
				in:fly={{ x: -40, duration: 350, opacity: 0, easing: cubicInOut }}
			>
				{#if currentView === 'dashboard'}
					<Dashboard />
				{:else if currentView === 'todo'}
					<TodoList />
				{:else if currentView === 'pomodoro'}
					<Pomodoro />
				{:else if currentView === 'kanban'}
					<Kanban />
				{:else if currentView === 'notes'}
					<Notes />
				{:else if currentView === 'diagrams'}
					<Diagrams />
				{:else if currentView === 'map'}
					<Map />
				{/if}
			</div>
		{/key}
	</main>
</div>
