<script lang="ts">
	import type { PomodoroType, PomodoroConfig } from '$lib/types';
	import {
		getIsRunning,
		getTimeLeft,
		getCurrentType,
		getSessionCount,
		getConfig,
		updateConfig,
		startTimer,
		pauseTimer,
		resetTimer,
		switchType
	} from '$lib/stores/pomodoro.svelte.js';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Settings from '@lucide/svelte/icons/settings';
	import Timer from '@lucide/svelte/icons/timer';
	import Coffee from '@lucide/svelte/icons/coffee';
	import Moon from '@lucide/svelte/icons/moon';
	import X from '@lucide/svelte/icons/x';

	const isRunning = $derived(getIsRunning());
	const timeLeft = $derived(getTimeLeft());
	const currentType: PomodoroType = $derived(getCurrentType());
	const sessionCount = $derived(getSessionCount());
	const config = $derived(getConfig());

	let showConfig = $state(false);
	let configForm = $state<PomodoroConfig>({ ...getConfig() });

	const minutes = $derived(Math.floor(timeLeft / 60));
	const seconds = $derived(timeLeft % 60);
	const total = $derived(
		currentType === 'work'
			? config.workDuration * 60
			: currentType === 'short_break'
				? config.shortBreakDuration * 60
				: config.longBreakDuration * 60
	);
	const progress = $derived(total > 0 ? ((total - timeLeft) / total) * 100 : 0);

	const circumference = 2 * Math.PI * 90;
	const strokeDashoffset = $derived(circumference - (progress / 100) * circumference);

	const typeInfo: Record<PomodoroType, { label: string; color: string }> = {
		work: { label: 'Focus', color: '#818cf8' },
		short_break: { label: 'Short Break', color: '#4ade80' },
		long_break: { label: 'Long Break', color: '#60a5fa' }
	};

	function toggleConfig() {
		showConfig = !showConfig;
		if (showConfig) configForm = { ...getConfig() };
	}

	function saveConfigForm() {
		updateConfig(configForm);
		showConfig = false;
	}
</script>

<div class="mx-auto max-w-md">
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-text-primary">Pomodoro</h1>
		<p class="mt-0.5 text-sm text-text-secondary">{sessionCount} sessions completed</p>
	</div>

	<div class="mb-6 flex justify-center gap-1.5">
		{#each Object.entries(typeInfo) as [type, info] (type)}
			<button
				class:cursor-pointer={true}
				onclick={() => switchType(type as PomodoroType)}
				disabled={isRunning}
				class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 {currentType ===
				type
					? 'text-white'
					: 'text-text-secondary hover:text-text-primary'}"
				style={currentType === type ? `background: ${info.color}` : ''}
			>
				{#if type === 'work'}
					<Timer class="h-3.5 w-3.5" />
				{:else if type === 'short_break'}
					<Coffee class="h-3.5 w-3.5" />
				{:else}
					<Moon class="h-3.5 w-3.5" />
				{/if}
				{info.label}
			</button>
		{/each}
	</div>

	<div class="relative mx-auto mb-6 flex h-64 w-64 items-center justify-center">
		<svg class="absolute h-full w-full -rotate-90" viewBox="0 0 200 200">
			<circle cx="100" cy="100" r="90" fill="none" stroke="#2a2b2e" stroke-width="5" />
			<circle
				cx="100"
				cy="100"
				r="90"
				fill="none"
				stroke={typeInfo[currentType].color}
				stroke-width="5"
				stroke-linecap="butt"
				stroke-dasharray={circumference}
				stroke-dashoffset={strokeDashoffset}
				class="transition-all duration-1000"
			/>
		</svg>
		<div class="text-center">
			<p class="text-5xl font-bold tracking-tight text-text-primary tabular-nums">
				{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
			</p>
			<p
				class="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary"
			>
				{#if currentType === 'work'}
					<Timer class="h-3.5 w-3.5" />
				{:else if currentType === 'short_break'}
					<Coffee class="h-3.5 w-3.5" />
				{:else}
					<Moon class="h-3.5 w-3.5" />
				{/if}
				{typeInfo[currentType].label}
			</p>
		</div>
	</div>

	<div class="flex justify-center gap-2">
		{#if isRunning}
			<button
				class:cursor-pointer={true}
				onclick={pauseTimer}
				class="flex items-center gap-1.5 border border-warning/30 bg-warning/10 px-6 py-2 text-xs font-semibold text-warning transition-colors hover:bg-warning/20"
			>
				<Pause class="h-3.5 w-3.5" />
				Pause
			</button>
		{:else}
			<button
				class:cursor-pointer={true}
				onclick={startTimer}
				class="flex items-center gap-1.5 bg-accent px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
			>
				<Play class="h-3.5 w-3.5" />
				Start
			</button>
		{/if}

		<button
			class:cursor-pointer={true}
			onclick={resetTimer}
			disabled={isRunning && timeLeft === 0}
			class="    flex items-center gap-1.5 border border-surface-3 bg-surface-2 px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed"
		>
			<RotateCcw class="h-3.5 w-3.5" />
			Reset
		</button>
		<button
			class:cursor-pointer={true}
			onclick={toggleConfig}
			class="flex items-center gap-1.5 border border-surface-3 bg-surface-2 px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-3"
		>
			<Settings class="h-3.5 w-3.5" />
		</button>
	</div>

	{#if showConfig}
		<div class="mt-6 border border-surface-3 bg-surface-2 px-4 py-4">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-xs font-semibold text-text-primary">Settings</h3>
				<button
					class:cursor-pointer={true}
					onclick={toggleConfig}
					class="text-text-muted hover:text-text-primary"
				>
					<X class="h-3.5 w-3.5" />
				</button>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="pomo-work" class="text-xs font-medium text-text-muted">Focus (min)</label>
					<input
						id="pomo-work"
						type="number"
						min="1"
						max="120"
						bind:value={configForm.workDuration}
						class="mt-1 w-full border border-surface-3 bg-surface-3 px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
					/>
				</div>
				<div>
					<label for="pomo-short" class="text-xs font-medium text-text-muted"
						>Short Break (min)</label
					>
					<input
						id="pomo-short"
						type="number"
						min="1"
						max="30"
						bind:value={configForm.shortBreakDuration}
						class="mt-1 w-full border border-surface-3 bg-surface-3 px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
					/>
				</div>
				<div>
					<label for="pomo-long" class="text-xs font-medium text-text-muted">Long Break (min)</label
					>
					<input
						id="pomo-long"
						type="number"
						min="1"
						max="60"
						bind:value={configForm.longBreakDuration}
						class="mt-1 w-full border border-surface-3 bg-surface-3 px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
					/>
				</div>
				<div>
					<label for="pomo-interval" class="text-xs font-medium text-text-muted"
						>Sessions before long break</label
					>
					<input
						id="pomo-interval"
						type="number"
						min="1"
						max="10"
						bind:value={configForm.sessionsBeforeLongBreak}
						class="mt-1 w-full border border-surface-3 bg-surface-3 px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
					/>
				</div>
			</div>
			<div class="mt-4 flex justify-end gap-2">
				<button
					class:cursor-pointer={true}
					onclick={() => (showConfig = false)}
					class="border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3"
				>
					Cancel
				</button>
				<button
					class:cursor-pointer={true}
					onclick={saveConfigForm}
					class="bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Save
				</button>
			</div>
		</div>
	{/if}
</div>
