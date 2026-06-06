<script lang="ts">
	import type { Priority } from '$lib/types';
	import {
		getTasks,
		addTask,
		toggleTask,
		deleteTask,
		updateTask,
		isLoading
	} from '$lib/stores/todo.svelte.js';
	import { unlockAchievement } from '$lib/stores/gamification.svelte.js';
	import { getT } from '$lib/stores/i18n.svelte.js';
	import type { Task } from '$lib/types';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Check from '@lucide/svelte/icons/check';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Edit3 from '@lucide/svelte/icons/edit-3';
	import Flag from '@lucide/svelte/icons/flag';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import { fly, fade, scale } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	const tasks = $derived(getTasks());
	const loading = $derived(isLoading());
	const t = $derived(getT());
	let showAddPopup = $state(false);
	let newTitle = $state('');
	let newPriority = $state<Priority>('medium');
	let filter = $state<'all' | 'active' | 'completed'>('all');

	let showTaskPopup = $state(false);
	let taskPopupMode = $state<'view' | 'edit'>('view');
	let taskPopupId = $state<string | null>(null);
	let taskPopupTitle = $state('');
	let taskPopupDescription = $state('');
	let taskPopupPriority = $state<Priority>('medium');

	function openAddPopup() {
		newTitle = '';
		newPriority = 'medium';
		showAddPopup = true;
	}

	function handleAdd() {
		const title = newTitle.trim();
		if (!title) return;
		addTask(title, newPriority);
		showAddPopup = false;
	}

	function openTaskPopup(task: Task) {
		taskPopupId = task.id;
		taskPopupTitle = task.title;
		taskPopupDescription = task.description;
		taskPopupPriority = task.priority;
		taskPopupMode = 'view';
		showTaskPopup = true;
	}

	function switchToEdit() {
		taskPopupMode = 'edit';
	}

	function handleSaveTask() {
		if (!taskPopupId || !taskPopupTitle.trim()) return;
		updateTask(taskPopupId, {
			title: taskPopupTitle.trim(),
			description: taskPopupDescription,
			priority: taskPopupPriority
		});
		showTaskPopup = false;
	}

	function handleDeleteTask() {
		if (!taskPopupId) return;
		deleteTask(taskPopupId);
		showTaskPopup = false;
	}

	function handleToggleTask() {
		if (!taskPopupId) return;
		toggleTask(taskPopupId);
	}

	function handlePopupPriorityChange() {
		if (!taskPopupId) return;
		const p =
			taskPopupPriority === 'high'
				? ('medium' as const)
				: taskPopupPriority === 'medium'
					? ('low' as const)
					: ('high' as const);
		taskPopupPriority = p;
		updateTask(taskPopupId, { priority: p });
		unlockAchievement('prioritizer');
	}

	function closeTaskPopup() {
		showTaskPopup = false;
	}

	const filtered = $derived(
		tasks
			.filter((t) => {
				if (filter === 'active') return !t.completed;
				if (filter === 'completed') return t.completed;
				return true;
			})
			.sort((a, b) => {
				const order = { high: 0, medium: 1, low: 2 };
				if (a.completed !== b.completed) return a.completed ? 1 : -1;
				return order[a.priority] - order[b.priority];
			})
	);

	const activeCount = $derived(tasks.filter((t) => !t.completed).length);
	const completedCount = $derived(tasks.filter((t) => t.completed).length);

	const pageSize = 8;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
	const pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
	const paged = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});
</script>

<div class="mx-auto max-w-3xl">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-text-primary">{t.todo.title}</h1>
		<p class="mt-0.5 text-sm text-text-secondary">
			{activeCount}
			{t.todo.active} &middot; {completedCount}
			{t.todo.completed}
		</p>
	</div>

	<div class="mb-4 flex items-center justify-between">
		<div class="flex gap-1.5">
			<button
				class:cursor-pointer={true}
				onclick={() => (filter = 'all')}
				class="px-2.5 py-1.5 text-xs font-medium transition-colors {filter === 'all'
					? 'bg-accent/10 text-accent'
					: 'bg-surface-3 text-text-muted hover:text-text-primary'}"
			>
				{t.todo.all} ({tasks.length})
			</button>
			<button
				class:cursor-pointer={true}
				onclick={() => (filter = 'active')}
				class="px-2.5 py-1.5 text-xs font-medium transition-colors {filter === 'active'
					? 'bg-accent/10 text-accent'
					: 'bg-surface-3 text-text-muted hover:text-text-primary'}"
			>
				{t.todo.activeFilter} ({activeCount})
			</button>
			<button
				class:cursor-pointer={true}
				onclick={() => (filter = 'completed')}
				class="px-2.5 py-1.5 text-xs font-medium transition-colors {filter === 'completed'
					? 'bg-accent/10 text-accent'
					: 'bg-surface-3 text-text-muted hover:text-text-primary'}"
			>
				{t.todo.completedFilter} ({completedCount})
			</button>
		</div>
		<button
			class:cursor-pointer={true}
			onclick={openAddPopup}
			class="flex items-center gap-1.5 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
		>
			<Plus class="h-3.5 w-3.5" />
			{t.todo.newTask}
		</button>
	</div>

	{#if showAddPopup}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			transition:fade={{ duration: 150 }}
			onclick={() => (showAddPopup = false)}
			onkeydown={(e) => e.key === 'Escape' && (showAddPopup = false)}
			role="presentation"
		>
			<div
				class="w-full max-w-md border border-surface-3 bg-surface-2 p-5"
				transition:scale={{ duration: 150, start: 0.95 }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={() => {}}
				role="dialog"
				tabindex="-1"
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-base font-semibold text-text-primary">{t.todo.newTask}</h2>
					<button
						class:cursor-pointer={true}
						onclick={() => (showAddPopup = false)}
						class="p-1 text-text-muted transition-colors hover:text-text-primary"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
				<input
					bind:value={newTitle}
					placeholder={t.todo.taskTitle}
					class="mb-3 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
					onkeydown={(e) => e.key === 'Enter' && handleAdd()}
				/>
				<select
					class:cursor-pointer={true}
					bind:value={newPriority}
					class="mb-4 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
				>
					<option value="low">{t.todo.low}</option>
					<option value="medium">{t.todo.medium}</option>
					<option value="high">{t.todo.high}</option>
				</select>
				<div class="flex justify-end gap-2">
					<button
						class:cursor-pointer={true}
						onclick={() => (showAddPopup = false)}
						class="border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3"
					>
						{t.todo.cancel}
					</button>
					<button
						class:cursor-pointer={true}
						onclick={handleAdd}
						disabled={!newTitle.trim()}
						class="bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					>
						{t.todo.create}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showTaskPopup}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			transition:fade={{ duration: 150 }}
			onclick={closeTaskPopup}
			onkeydown={(e) => e.key === 'Escape' && closeTaskPopup()}
			role="presentation"
		>
			<div
				class="w-full max-w-md border border-surface-3 bg-surface-2 p-5"
				transition:scale={{ duration: 150, start: 0.95 }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={() => {}}
				role="dialog"
				tabindex="-1"
			>
				{#if taskPopupMode === 'view'}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-base font-semibold text-text-primary">{taskPopupTitle}</h2>
						<button
							class:cursor-pointer={true}
							onclick={closeTaskPopup}
							class="p-1 text-text-muted transition-colors hover:text-text-primary"
						>
							<X class="h-4 w-4" />
						</button>
					</div>

					<div class="mb-4 flex items-center gap-3">
						<button
							class:cursor-pointer={true}
							onclick={handleToggleTask}
							class="flex h-5 w-5 shrink-0 items-center justify-center border {taskPopupId !=
								null && tasks.find((t) => t.id === taskPopupId)?.completed
								? 'border-success bg-success/10'
								: 'border-surface-4'}"
						>
							{#if taskPopupId != null && tasks.find((t) => t.id === taskPopupId)?.completed}
								<Check class="h-3 w-3 text-success" />
							{/if}
						</button>
						<span class="text-sm text-text-secondary">
							{taskPopupId != null && tasks.find((t) => t.id === taskPopupId)?.completed
								? t.todo.statusCompleted
								: t.todo.statusActive}
						</span>
						<button
							class:cursor-pointer={true}
							onclick={handlePopupPriorityChange}
							class="ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium {taskPopupPriority ===
							'high'
								? 'bg-priority-high/10 text-priority-high'
								: taskPopupPriority === 'medium'
									? 'bg-priority-medium/10 text-priority-medium'
									: 'bg-priority-low/10 text-priority-low'}"
						>
							<Flag class="h-3 w-3" />
							{taskPopupPriority}
						</button>
					</div>

					{#if taskPopupDescription}
						<p class="mb-6 text-sm whitespace-pre-wrap text-text-secondary">
							{taskPopupDescription}
						</p>
					{:else}
						<p class="mb-6 text-sm text-text-muted italic">{t.todo.noDescription}</p>
					{/if}

					<div class="flex justify-end gap-2">
						<button
							class:cursor-pointer={true}
							onclick={handleDeleteTask}
							class="flex items-center gap-1 border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:border-danger hover:text-danger"
						>
							<Trash2 class="h-3.5 w-3.5" />
							{t.todo.delete}
						</button>
						<button
							class:cursor-pointer={true}
							onclick={switchToEdit}
							class="flex items-center gap-1 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
						>
							<Edit3 class="h-3.5 w-3.5" />
							{t.todo.edit}
						</button>
					</div>
				{:else}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-base font-semibold text-text-primary">{t.todo.editTask}</h2>
						<button
							class:cursor-pointer={true}
							onclick={closeTaskPopup}
							class="p-1 text-text-muted transition-colors hover:text-text-primary"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
					<input
						bind:value={taskPopupTitle}
						placeholder={t.todo.taskTitle}
						class="mb-3 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
					/>
					<textarea
						bind:value={taskPopupDescription}
						placeholder={t.todo.description}
						class="mb-3 w-full resize-none border border-surface-3 bg-surface-3 px-3 py-2 text-xs text-text-secondary outline-none"
						rows="4"
					></textarea>
					<select
						class:cursor-pointer={true}
						bind:value={taskPopupPriority}
						class="mb-4 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
					>
						<option value="low">{t.todo.low}</option>
						<option value="medium">{t.todo.medium}</option>
						<option value="high">{t.todo.high}</option>
					</select>
					<div class="flex justify-end gap-2">
						<button
							class:cursor-pointer={true}
							onclick={closeTaskPopup}
							class="border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3"
						>
							{t.todo.cancel}
						</button>
						<button
							class:cursor-pointer={true}
							onclick={handleSaveTask}
							disabled={!taskPopupTitle.trim()}
							class="flex items-center gap-1 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
						>
							<Save class="h-3.5 w-3.5" />
							{t.todo.save}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="py-12 text-center text-sm text-text-muted">{t.todo.loading}</div>
	{:else if filtered.length === 0}
		<div class="flex flex-col items-center py-12 text-text-muted">
			<ListTodo class="mb-2 h-8 w-8" />
			<p class="text-sm">{t.todo.noTasksFound}</p>
		</div>
	{:else}
		<div class="space-y-1">
			{#each paged as task, i (task.id)}
				<button
					class:cursor-pointer={true}
					onclick={() => openTaskPopup(task)}
					in:fly={{ x: -20, duration: 300, delay: i * 50, opacity: 0, easing: cubicInOut }}
					class="flex w-full items-center gap-3 border border-surface-3 bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-surface-4 {task.completed
						? 'opacity-60'
						: ''}"
				>
					<div
						class="h-full w-1 shrink-0 self-stretch {task.priority === 'high'
							? 'bg-priority-high'
							: task.priority === 'medium'
								? 'bg-priority-medium'
								: 'bg-priority-low'}"
					></div>
					<p
						class="min-w-0 flex-1 truncate text-sm {task.completed
							? 'text-text-muted line-through'
							: 'text-text-primary'}"
					>
						{task.title}
					</p>
				</button>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="mt-4 flex items-center justify-center gap-1">
				<button
					class:cursor-pointer={true}
					onclick={() => (page = Math.max(1, page - 1))}
					disabled={page <= 1}
					class="border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{t.todo.prev}
				</button>
				{#each pages as p (p)}
					<button
						class:cursor-pointer={true}
						onclick={() => (page = p)}
						class="min-w-[32px] border px-2.5 py-1.5 text-xs font-medium transition-colors {page ===
						p
							? 'border-accent bg-accent/10 text-accent'
							: 'border-surface-3 bg-surface-2 text-text-muted hover:bg-surface-3'}"
					>
						{p}
					</button>
				{/each}
				<button
					class:cursor-pointer={true}
					onclick={() => (page = Math.min(totalPages, page + 1))}
					disabled={page >= totalPages}
					class="border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{t.todo.next}
				</button>
			</div>
		{/if}
	{/if}
</div>
