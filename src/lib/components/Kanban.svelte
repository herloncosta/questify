<script lang="ts">
	import type { TaskStatus, Priority } from '$lib/types';
	import {
		getTasksByStatus,
		addTask,
		updateTask,
		toggleTask,
		deleteTask
	} from '$lib/stores/todo.svelte.js';
	import { unlockAchievement } from '$lib/stores/gamification.svelte.js';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Check from '@lucide/svelte/icons/check';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const todo = $derived(getTasksByStatus('todo'));
	const doing = $derived(getTasksByStatus('doing'));
	const done = $derived(getTasksByStatus('done'));

	const PAGE_SIZE = 5;

	const columns: { status: TaskStatus; title: string; color: string }[] = [
		{ status: 'todo', title: 'To Do', color: 'var(--color-kanban-todo)' },
		{ status: 'doing', title: 'In Progress', color: 'var(--color-kanban-doing)' },
		{ status: 'done', title: 'Done', color: 'var(--color-kanban-done)' }
	];

	function getColumnTasks(status: TaskStatus) {
		switch (status) {
			case 'todo':
				return todo;
			case 'doing':
				return doing;
			case 'done':
				return done;
		}
	}

	function handleDragStart(e: DragEvent, taskId: string) {
		e.dataTransfer?.setData('text/plain', taskId);
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.classList.add('opacity-40');
		}
	}

	function handleDragEnd(e: DragEvent) {
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.classList.remove('opacity-40');
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent, status: TaskStatus) {
		e.preventDefault();
		const taskId = e.dataTransfer?.getData('text/plain');
		if (!taskId) return;
		const now = Date.now();
		const completed = status === 'done';
		updateTask(taskId, {
			status,
			order: getColumnTasks(status).length,
			completed,
			completedAt: completed ? now : undefined
		});
		unlockAchievement('prioritizer');
	}

	let showAdd = $state<TaskStatus | null>(null);
	let newTitle = $state('');
	let newPriority = $state<Priority>('medium');
	let colPage = $state<Record<TaskStatus, number>>({ todo: 1, doing: 1, done: 1 });

	function pageFor(status: TaskStatus) {
		return colPage[status] || 1;
	}

	function totalPages(status: TaskStatus) {
		return Math.max(1, Math.ceil(getColumnTasks(status).length / PAGE_SIZE));
	}

	function visibleTasks(status: TaskStatus) {
		const all = getColumnTasks(status);
		const p = pageFor(status);
		return all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
	}

	function goPrev(status: TaskStatus) {
		colPage = { ...colPage, [status]: Math.max(1, pageFor(status) - 1) };
	}

	function goNext(status: TaskStatus) {
		const max = totalPages(status);
		colPage = { ...colPage, [status]: Math.min(max, pageFor(status) + 1) };
	}

	$effect(() => {
		for (const s of ['todo', 'doing', 'done'] as TaskStatus[]) {
			if (pageFor(s) > totalPages(s)) {
				colPage = { ...colPage, [s]: Math.max(1, totalPages(s)) };
			}
		}
	});

	function handleAdd(status: TaskStatus) {
		const title = newTitle.trim();
		if (!title) return;
		const task = addTask(title, newPriority);
		updateTask(task.id, { status });
		newTitle = '';
		showAdd = null;
	}

	const priorityColors: Record<Priority, string> = {
		high: 'var(--color-priority-high)',
		medium: 'var(--color-priority-medium)',
		low: 'var(--color-priority-low)'
	};
</script>

<div class="mx-auto max-w-6xl">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-text-primary">Kanban</h1>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		{#each columns as col (col.status)}
			<div
				role="region"
				aria-label="{col.title} column"
				class="flex min-h-100 flex-col border border-surface-3 bg-surface-2/60 px-3 pt-3 pb-3"
				ondragover={handleDragOver}
				ondrop={(e) => handleDrop(e, col.status)}
			>
				<div class="mb-3 flex items-center justify-between px-1">
					<div class="flex items-center gap-2">
						<div class="h-2.5 w-2.5" style="background: {col.color}"></div>
						<h3 class="text-xs font-semibold text-text-primary">{col.title}</h3>
						<span class="bg-surface-3 px-1.5 py-0.5 text-[11px] text-text-muted"
							>{getColumnTasks(col.status).length}</span
						>
					</div>
					<button
						class:cursor-pointer={true}
						onclick={() => {
							showAdd = col.status;
							newTitle = '';
						}}
						class="p-1 text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary"
						aria-label="Add task to {col.title}"
					>
						<Plus class="h-3.5 w-3.5" />
					</button>
				</div>

				{#if showAdd === col.status}
					<div class="mb-2 border border-accent/20 bg-surface-3 px-3 py-2.5">
						<input
							bind:value={newTitle}
							placeholder="Task title..."
							class="mb-2 w-full border border-surface-3 bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none"
							onkeydown={(e) => {
								if (e.key === 'Enter') handleAdd(col.status);
								if (e.key === 'Escape') showAdd = null;
							}}
						/>
						<div class="flex gap-1.5">
							<select
								class:cursor-pointer={true}
								bind:value={newPriority}
								class="flex-1 border border-surface-3 bg-surface-2 px-2 py-1 text-[11px] text-text-primary outline-none"
							>
								<option value="low">Low</option>
								<option value="medium">Med</option>
								<option value="high">High</option>
							</select>
							<button
								class:cursor-pointer={true}
								onclick={() => handleAdd(col.status)}
								class="bg-accent px-2.5 py-1 text-[11px] font-medium text-white"
							>
								Add
							</button>
						</div>
					</div>
				{/if}

				<div class="flex flex-1 flex-col gap-1.5">
					{#if getColumnTasks(col.status).length === 0}
						<div class="flex flex-1 items-center justify-center py-8 text-xs text-text-muted">
							Drop tasks here
						</div>
					{:else}
						{#each visibleTasks(col.status) as task (task.id)}
							<div
								role="listitem"
								draggable="true"
								ondragstart={(e) => handleDragStart(e, task.id)}
								ondragend={handleDragEnd}
								class="cursor-grab border border-surface-3 bg-surface-2 px-3 py-2.5 transition-colors hover:border-surface-4 active:cursor-grabbing"
							>
								<div class="mb-1.5 flex items-start justify-between gap-2">
									<p class="text-sm font-medium text-text-primary">{task.title}</p>
									<div class="flex shrink-0 gap-0.5">
										{#if col.status !== 'done'}
											<button
												class:cursor-pointer={true}
												onclick={() => toggleTask(task.id)}
												class="p-0.5 text-text-muted transition-colors hover:text-success"
												aria-label="Complete task"
											>
												<Check class="h-3 w-3" />
											</button>
										{/if}
										<button
											class:cursor-pointer={true}
											onclick={() => deleteTask(task.id)}
											class="p-0.5 text-text-muted transition-colors hover:text-danger"
											aria-label="Delete task"
										>
											<X class="h-3 w-3" />
										</button>
									</div>
								</div>
								<div class="flex items-center gap-1.5">
									<span
										class="px-1.5 py-0.5 text-[10px] font-medium uppercase"
										style="background: {priorityColors[task.priority]}15; color: {priorityColors[
											task.priority
										]}"
									>
										{task.priority}
									</span>
								</div>
							</div>
						{/each}

						{#if totalPages(col.status) > 1}
							<div class="mt-auto flex items-center justify-between border-t border-surface-3 pt-2">
								<button
									class:cursor-pointer={true}
									onclick={() => goPrev(col.status)}
									disabled={pageFor(col.status) <= 1}
									class="flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
								>
									<ChevronLeft class="h-3 w-3" />
									Prev
								</button>
								<span class="text-[11px] text-text-muted">
									{pageFor(col.status)} / {totalPages(col.status)}
								</span>
								<button
									class:cursor-pointer={true}
									onclick={() => goNext(col.status)}
									disabled={pageFor(col.status) >= totalPages(col.status)}
									class="flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
								>
									Next
									<ChevronRight class="h-3 w-3" />
								</button>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
