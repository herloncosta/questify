<script lang="ts">
	import type { View } from '$lib/types';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Gamification from '$lib/components/Gamification.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import TodoList from '$lib/components/TodoList.svelte';
	import Pomodoro from '$lib/components/Pomodoro.svelte';
	import Kanban from '$lib/components/Kanban.svelte';
	import Notes from '$lib/components/Notes.svelte';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	let currentView = $state<View>('dashboard');
	let mobileOpen = $state(false);
	let collapsed = $state(false);
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

	<Sidebar bind:current={currentView} bind:mobileOpen bind:collapsed />
	<Gamification />

	<main
		class="flex-1 px-4 py-16 transition-all duration-200 md:px-8 md:py-8 {collapsed
			? 'md:ml-16'
			: 'md:ml-56'}"
	>
		{#key currentView}
			<div in:fly={{ x: -40, duration: 350, opacity: 0, easing: cubicInOut }}>
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
				{/if}
			</div>
		{/key}
	</main>
</div>
