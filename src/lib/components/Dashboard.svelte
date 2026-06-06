<script lang="ts">
	import { getTasks } from '$lib/stores/todo.svelte.js';
	import { getStats, getXpProgress, getAchievements } from '$lib/stores/gamification.svelte.js';
	import {
		getIsRunning,
		getTimeLeft,
		getCurrentType,
		getConfig
	} from '$lib/stores/pomodoro.svelte.js';
	import { getT } from '$lib/stores/i18n.svelte.js';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import Award from '@lucide/svelte/icons/award';
	import Flame from '@lucide/svelte/icons/flame';
	import Clock from '@lucide/svelte/icons/clock';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Trophy from '@lucide/svelte/icons/trophy';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';

	const tasks = $derived(getTasks());
	const stats = $derived(getStats());
	const progress = $derived(getXpProgress());
	const achievements = $derived(getAchievements());
	const t = $derived(getT());

	const totalTasks = $derived(tasks.length);
	const completed = $derived(tasks.filter((t) => t.completed).length);
	const highPriority = $derived(tasks.filter((t) => t.priority === 'high' && !t.completed).length);
	const completionRate = $derived(totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0);

	const unlockedAchievements = $derived(achievements.filter((a) => a.unlocked).length);
	const totalAchievements = $derived(achievements.length);

	const nextLevelXp = $derived(stats.level ** 2 * 100);

	const isPomodoroActive = $derived(getIsRunning());
	const pomodoroTimeLeft = $derived(getTimeLeft());
	const pomodoroType = $derived(getCurrentType());
	const pomodoroConfig = $derived(getConfig());
	const pomodoroTotalSecs = $derived(
		pomodoroType === 'work'
			? pomodoroConfig.workDuration * 60
			: pomodoroType === 'short_break'
				? pomodoroConfig.shortBreakDuration * 60
				: pomodoroConfig.longBreakDuration * 60
	);
	const pomodoroProgress = $derived(
		pomodoroTotalSecs > 0 ? ((1 - pomodoroTimeLeft / pomodoroTotalSecs) * 100).toFixed(1) : '0'
	);
	const pomodoroLabel = $derived(
		pomodoroType === 'work'
			? t.pomodoro.focus
			: pomodoroType === 'short_break'
				? t.pomodoro.shortBreak
				: t.pomodoro.longBreak
	);
	const pomodoroMinutes = $derived(Math.floor(pomodoroTimeLeft / 60));
	const pomodoroSeconds = $derived(pomodoroTimeLeft % 60);
	const pomodoroDisplay = $derived(
		`${pomodoroMinutes}:${pomodoroSeconds.toString().padStart(2, '0')}`
	);

	const recentTasks = $derived([...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
</script>

<div class="mx-auto max-w-4xl">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-text-primary">{t.dashboard.title}</h1>
		<p class="mt-0.5 text-sm text-text-secondary">{t.dashboard.subtitle}</p>
	</div>

	<div class="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-medium tracking-wider text-text-muted uppercase"
					>{t.dashboard.totalTasks}</span
				>
				<ListTodo class="h-4 w-4 text-text-muted" />
			</div>
			<p class="text-xl font-bold text-text-primary">{totalTasks}</p>
			<div class="mt-2 h-1 bg-surface-3">
				<div
					class="h-full bg-accent transition-all duration-500"
					style="width: {completionRate}%"
				></div>
			</div>
			<p class="mt-0.5 text-xs text-text-muted">
				{completed}
				{t.dashboard.completed} ({completionRate}%)
			</p>
		</div>

		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-medium tracking-wider text-text-muted uppercase"
					>{t.dashboard.level}</span
				>
				<Award class="h-4 w-4 text-accent" />
			</div>
			<p class="text-xl font-bold text-accent">{stats.level}</p>
			<div class="mt-2 h-1 bg-surface-3">
				<div
					class="h-full bg-gradient-to-r from-accent-soft to-accent transition-all duration-500"
					style="width: {progress.percent}%"
				></div>
			</div>
			<p class="mt-0.5 text-xs text-text-muted">{stats.xp} / {nextLevelXp} XP</p>
		</div>

		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-medium tracking-wider text-text-muted uppercase"
					>{t.dashboard.streak}</span
				>
				<Flame class="h-4 w-4 text-warning" />
			</div>
			<p class="text-xl font-bold text-warning">{stats.streak} {t.dashboard.days}</p>
			<p class="mt-0.5 text-xs text-text-muted">
				{stats.streak >= 3
					? `${stats.streak * 10} ${t.dashboard.xpDailyBonus}`
					: t.dashboard.keepGoing}
			</p>
		</div>

		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-medium tracking-wider text-text-muted uppercase"
					>{t.dashboard.focusTime}</span
				>
				<Clock class="h-4 w-4 text-success" />
			</div>
			<p class="text-xl font-bold text-success">{stats.totalFocusMinutes}m</p>
			<p class="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
				<Trophy class="h-3 w-3 text-accent" />
				{unlockedAchievements}/{totalAchievements}
				{t.dashboard.achievements}
			</p>
		</div>
	</div>

	{#if isPomodoroActive}
		<div class="mb-8 border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Clock class="h-4 w-4 text-success" />
					<h3 class="text-xs font-semibold text-text-primary">
						{t.dashboard.pomodoro} — {pomodoroLabel}
					</h3>
				</div>
				<span class="text-sm font-bold text-text-primary">{pomodoroDisplay}</span>
			</div>
			<div class="h-2 bg-surface-3">
				<div
					class="h-full bg-success transition-all duration-1000"
					style="width: {pomodoroProgress}%"
				></div>
			</div>
			<p class="mt-1.5 text-xs text-text-muted">{pomodoroProgress}% {t.dashboard.complete}</p>
		</div>
	{/if}

	<div class="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-3 flex items-center gap-2">
				<AlertTriangle class="h-4 w-4 text-danger" />
				<h3 class="text-xs font-semibold text-text-primary">{t.dashboard.highPriorityTasks}</h3>
			</div>
			{#if highPriority === 0}
				<p class="text-sm text-text-muted">{t.dashboard.noHighPriority}</p>
			{:else}
				<p class="text-2xl font-bold text-danger">{highPriority}</p>
				<p class="text-xs text-text-secondary">{t.dashboard.tasksNeedAttention}</p>
			{/if}
		</div>

		<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
			<div class="mb-3 flex items-center gap-2">
				<Trophy class="h-4 w-4 text-accent" />
				<h3 class="text-xs font-semibold text-text-primary">{t.dashboard.achievementsTitle}</h3>
			</div>
			<div class="flex flex-wrap gap-1.5">
				{#each achievements as a (a.id)}
					<div
						class="flex items-center gap-1 px-2 py-1 text-xs font-medium {a.unlocked
							? 'bg-accent/10 text-accent'
							: 'bg-surface-3 text-text-muted opacity-50'}"
						title={t.achievements[a.id]?.desc || a.description}
					>
						<Trophy class="h-3 w-3" />
						{t.achievements[a.id]?.title || a.title}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="border border-surface-3 bg-surface-2 px-4 py-3.5">
		<h3 class="mb-3 text-xs font-semibold text-text-primary">{t.dashboard.recentTasks}</h3>
		{#if recentTasks.length === 0}
			<p class="text-sm text-text-muted">{t.dashboard.noTasks}</p>
		{:else}
			<div class="space-y-1.5">
				{#each recentTasks as task (task.id)}
					<div class="flex items-center gap-2.5">
						{#if task.completed}
							<CheckCircle2 class="h-3.5 w-3.5 shrink-0 text-success" />
						{:else}
							<div
								class="h-3.5 w-3.5 shrink-0 border border-surface-4 {task.priority === 'high'
									? 'border-danger'
									: ''}"
							></div>
						{/if}
						<span
							class="text-sm {task.completed
								? 'text-text-muted line-through'
								: 'text-text-primary'}"
						>
							{task.title}
						</span>
						<span
							class="ml-auto text-[10px] font-medium uppercase {task.priority === 'high'
								? 'text-priority-high'
								: task.priority === 'medium'
									? 'text-priority-medium'
									: 'text-priority-low'}"
						>
							{task.priority}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
