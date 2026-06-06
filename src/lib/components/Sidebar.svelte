<script lang="ts">
	import type { View } from '$lib/types';
	import { getStats, getXpProgress } from '$lib/stores/gamification.svelte.js';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import Timer from '@lucide/svelte/icons/timer';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import FileText from '@lucide/svelte/icons/file-text';
	import Flame from '@lucide/svelte/icons/flame';
	import Award from '@lucide/svelte/icons/award';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Languages from '@lucide/svelte/icons/languages';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte.js';
	import { getLocale, toggleLocale, getT } from '$lib/stores/i18n.svelte.js';
	import logo from '$lib/assets/logo.png';

	let {
		current = $bindable<View>('dashboard'),
		mobileOpen = $bindable(false),
		collapsed = $bindable(false)
	}: { current: View; mobileOpen: boolean; collapsed: boolean } = $props();

	$effect(() => {
		try {
			const stored = localStorage.getItem('sidebar-collapsed');
			if (stored === 'true') collapsed = true;
		} catch {
			// ignore
		}
	});

	$effect(() => {
		localStorage.setItem('sidebar-collapsed', String(collapsed));
	});

	const stats = $derived(getStats());
	const progress = $derived(getXpProgress());
	const theme = $derived(getTheme());
	const locale = $derived(getLocale());
	const t = $derived(getT());

	const nav = $derived([
		{ id: 'dashboard' as const, label: t.nav.dashboard, icon: LayoutDashboard },
		{ id: 'todo' as const, label: t.nav.todo, icon: ListTodo },
		{ id: 'pomodoro' as const, label: t.nav.pomodoro, icon: Timer },
		{ id: 'kanban' as const, label: t.nav.kanban, icon: Columns3 },
		{ id: 'notes' as const, label: t.nav.notes, icon: FileText }
	]);

	function handleNav(id: View) {
		current = id;
		mobileOpen = false;
	}
</script>

{#if mobileOpen}
	<div
		class="fixed inset-0 z-30 bg-black/50 md:hidden"
		onclick={() => (mobileOpen = false)}
		role="presentation"
	></div>
{/if}

<aside
	class="fixed inset-y-0 right-0 z-40 flex flex-col overflow-hidden border-l border-surface-3 bg-surface-2 transition-all duration-200 {collapsed
		? 'w-16'
		: 'w-56'} {mobileOpen
		? 'translate-x-0'
		: 'translate-x-full'} md:right-auto md:left-0 md:translate-x-0 md:border-r md:border-l-0"
>
	<div
		class="flex items-center border-b border-surface-3 {collapsed
			? 'justify-center px-2 py-4'
			: 'gap-2.5 px-4 py-4'}"
	>
		<div class="flex h-8 w-8 shrink-0 items-center justify-center">
			<img src={logo} alt="Questify" class="h-8 w-8" />
		</div>
		{#if !collapsed}
			<span class="text-base font-semibold tracking-tight text-text-primary">Questify</span>
		{/if}
	</div>

	{#if !collapsed}
		<div class="border-b border-surface-3 px-4 py-3">
			<div class="mb-1.5 flex items-center gap-2">
				<Award class="h-3.5 w-3.5 text-accent" />
				<span class="text-xs font-semibold text-accent">{t.sidebar.level} {stats.level}</span>
			</div>
			<div class="mb-1 h-1.5 overflow-hidden bg-surface-3">
				<div
					class="h-full bg-accent transition-all duration-500"
					style="width: {progress.percent}%"
				></div>
			</div>
			<div class="flex items-center justify-between text-[11px] text-text-muted">
				<span>{stats.xp} {t.sidebar.xp}</span>
				<span>{progress.current}/{progress.max}</span>
			</div>
			<div class="mt-2 flex items-center gap-3 text-[11px] text-text-secondary">
				<span class="flex items-center gap-1">
					<Flame class="h-3 w-3 text-warning" />
					{stats.streak}
					{t.sidebar.dayStreak}
				</span>
				<span>{stats.achievements.length} {t.sidebar.achievements}</span>
			</div>
		</div>
	{/if}

	<nav class="flex-1 space-y-0.5 px-2 py-3">
		{#each nav as item (item.id)}
			<button
				class:cursor-pointer={true}
				onclick={() => handleNav(item.id)}
				class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors {current ===
				item.id
					? 'bg-accent/10 text-accent'
					: 'text-text-secondary hover:bg-surface-3 hover:text-text-primary'} {collapsed
					? 'justify-center'
					: ''}"
				title={collapsed ? item.label : undefined}
			>
				<item.icon class="h-4 w-4 shrink-0" />
				{#if !collapsed}
					{item.label}
				{/if}
			</button>
		{/each}
	</nav>

	<div class="space-y-1 border-t border-surface-3 px-2 py-2">
		<!-- THEME TOGGLE BUTTON -->
		<button
			class:cursor-pointer={true}
			onclick={toggleTheme}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary {collapsed
				? 'justify-center'
				: ''}"
			title={collapsed ? (theme === 'dark' ? t.sidebar.darkMode : t.sidebar.lightMode) : undefined}
		>
			{#if theme === 'dark'}
				<Moon class="h-3.5 w-3.5 shrink-0" />
			{:else}
				<Sun class="h-3.5 w-3.5 shrink-0" />
			{/if}
			{#if !collapsed}
				{theme === 'dark' ? t.sidebar.dark : t.sidebar.light} mode
			{/if}
		</button>
		<!-- LANGUAGE TOGGLE BUTTON -->
		<button
			class:cursor-pointer={true}
			onclick={() => {
				toggleLocale();
			}}
			class="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary {collapsed
				? 'justify-center'
				: ''}"
			title={collapsed ? (locale === 'pt' ? t.sidebar.portuguese : t.sidebar.english) : undefined}
		>
			<Languages class="h-3.5 w-3.5 shrink-0" />
			{#if !collapsed}
				{locale === 'en' ? t.sidebar.english : t.sidebar.portuguese}
			{/if}
		</button>
		<!-- COLLAPSE/EXPAND TOGGLE -->
		<button
			class:cursor-pointer={true}
			onclick={() => (collapsed = !collapsed)}
			class="hidden w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary md:flex {collapsed
				? 'justify-center'
				: ''}"
			title={collapsed ? t.sidebar.expand : t.sidebar.collapseSidebar}
		>
			{#if collapsed}
				<PanelLeftOpen class="h-3.5 w-3.5 shrink-0" />
			{:else}
				<PanelLeftClose class="h-3.5 w-3.5 shrink-0" />
				{t.sidebar.collapse}
			{/if}
		</button>
	</div>
</aside>
