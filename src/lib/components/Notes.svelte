<script lang="ts">
	import { getNotes, addNote, updateNote, deleteNote } from '$lib/stores/notes.svelte.js';
	import type { Note } from '$lib/types';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import FileText from '@lucide/svelte/icons/file-text';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Edit3 from '@lucide/svelte/icons/edit-3';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { fade, scale, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	const notes = $derived(getNotes());

	let showAddPopup = $state(false);
	let popupTitle = $state('');
	let popupContent = $state('');

	let showNotePopup = $state(false);
	let notePopupMode = $state<'view' | 'edit'>('view');
	let notePopupId = $state<string | null>(null);
	let notePopupTitle = $state('');
	let notePopupContent = $state('');

	const PAGE_SIZE = 9;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(notes.length / PAGE_SIZE)));
	const paged = $derived(notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});

	function openAddPopup() {
		popupTitle = '';
		popupContent = '';
		showAddPopup = true;
	}

	function handleAdd() {
		const title = popupTitle.trim();
		if (!title) return;
		addNote(title, popupContent);
		showAddPopup = false;
	}

	function openNote(note: Note) {
		notePopupId = note.id;
		notePopupTitle = note.title;
		notePopupContent = note.content;
		notePopupMode = 'view';
		showNotePopup = true;
	}

	function switchToEdit() {
		notePopupMode = 'edit';
	}

	function handleSaveNote() {
		if (!notePopupId || !notePopupTitle.trim()) return;
		updateNote(notePopupId, { title: notePopupTitle.trim(), content: notePopupContent });
		showNotePopup = false;
	}

	function handleDeleteNote() {
		if (!notePopupId) return;
		deleteNote(notePopupId);
		showNotePopup = false;
	}

	function closeNotePopup() {
		showNotePopup = false;
	}
</script>

<div class="mx-auto max-w-6xl">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-primary">Notes</h1>
			<p class="mt-0.5 text-sm text-text-secondary">{notes.length} notes</p>
		</div>
		<button
			class:cursor-pointer={true}
			onclick={openAddPopup}
			class="flex items-center gap-1.5 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
		>
			<Plus class="h-3.5 w-3.5" />
			New Note
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
				class="w-full max-w-lg border border-surface-3 bg-surface-2 p-5"
				transition:scale={{ duration: 150, start: 0.95 }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={() => {}}
				role="dialog"
				tabindex="-1"
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-base font-semibold text-text-primary">New Note</h2>
					<button
						class:cursor-pointer={true}
						onclick={() => (showAddPopup = false)}
						class="p-1 text-text-muted transition-colors hover:text-text-primary"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
				<input
					bind:value={popupTitle}
					placeholder="Note title..."
					class="mb-3 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
					onkeydown={(e) => e.key === 'Enter' && handleAdd()}
				/>
				<textarea
					bind:value={popupContent}
					placeholder="Write your note..."
					class="mb-4 w-full resize-none border border-surface-3 bg-surface-3 px-3 py-2 text-xs text-text-secondary outline-none"
					rows="8"
				></textarea>
				<div class="flex justify-end gap-2">
					<button
						class:cursor-pointer={true}
						onclick={() => (showAddPopup = false)}
						class="border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3"
					>
						Cancel
					</button>
					<button
						class:cursor-pointer={true}
						onclick={handleAdd}
						disabled={!popupTitle.trim()}
						class="bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					>
						Create
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showNotePopup}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			transition:fade={{ duration: 150 }}
			onclick={closeNotePopup}
			onkeydown={(e) => e.key === 'Escape' && closeNotePopup()}
			role="presentation"
		>
			<div
				class="w-full max-w-lg border border-surface-3 bg-surface-2 p-5"
				transition:scale={{ duration: 150, start: 0.95 }}
				onclick={(e) => e.stopPropagation()}
				onkeydown={() => {}}
				role="dialog"
				tabindex="-1"
			>
				{#if notePopupMode === 'view'}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-base font-semibold text-text-primary">{notePopupTitle}</h2>
						<button
							class:cursor-pointer={true}
							onclick={closeNotePopup}
							class="p-1 text-text-muted transition-colors hover:text-text-primary"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
					{#if notePopupContent}
						<p class="mb-6 text-sm whitespace-pre-wrap text-text-secondary">{notePopupContent}</p>
					{:else}
						<p class="mb-6 text-sm text-text-muted italic">No content</p>
					{/if}
					<div class="flex justify-end gap-2">
						<button
							class:cursor-pointer={true}
							onclick={handleDeleteNote}
							class="flex items-center gap-1 border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:border-danger hover:text-danger"
						>
							<Trash2 class="h-3.5 w-3.5" />
							Delete
						</button>
						<button
							class:cursor-pointer={true}
							onclick={switchToEdit}
							class="flex items-center gap-1 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
						>
							<Edit3 class="h-3.5 w-3.5" />
							Edit
						</button>
					</div>
				{:else}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-base font-semibold text-text-primary">Edit Note</h2>
						<button
							class:cursor-pointer={true}
							onclick={closeNotePopup}
							class="p-1 text-text-muted transition-colors hover:text-text-primary"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
					<input
						bind:value={notePopupTitle}
						placeholder="Note title..."
						class="mb-3 w-full border border-surface-3 bg-surface-3 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
					/>
					<textarea
						bind:value={notePopupContent}
						placeholder="Write your note..."
						class="mb-4 w-full resize-none border border-surface-3 bg-surface-3 px-3 py-2 text-xs text-text-secondary outline-none"
						rows="8"
					></textarea>
					<div class="flex justify-end gap-2">
						<button
							class:cursor-pointer={true}
							onclick={closeNotePopup}
							class="border border-surface-3 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3"
						>
							Cancel
						</button>
						<button
							class:cursor-pointer={true}
							onclick={handleSaveNote}
							disabled={!notePopupTitle.trim()}
							class="flex items-center gap-1 bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
						>
							<Save class="h-3.5 w-3.5" />
							Save
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if notes.length === 0}
		<div class="flex flex-col items-center py-12 text-text-muted">
			<FileText class="mb-2 h-8 w-8" />
			<p class="text-sm">No notes yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{#each paged as note, i (note.id)}
				<button
					class:cursor-pointer={true}
					onclick={() => openNote(note)}
					class="group flex flex-col border border-surface-3 bg-surface-2 p-3.5 text-left transition-colors hover:border-surface-4"
					in:fly={{ x: -20, duration: 300, delay: i * 50, opacity: 0, easing: cubicInOut }}
				>
					<div class="flex w-full items-start justify-between gap-2">
						<h3 class="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
							{note.title}
						</h3>
					</div>
					{#if note.content}
						<p class="mt-1 line-clamp-4 text-xs text-text-muted">{note.content}</p>
					{/if}
					<p class="mt-auto pt-2 text-[10px] text-text-muted/60">
						{new Date(note.updatedAt).toLocaleDateString()}
					</p>
				</button>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="mt-6 flex items-center justify-center gap-1">
				<button
					class:cursor-pointer={true}
					onclick={() => (page = Math.max(1, page - 1))}
					disabled={page <= 1}
					class="flex items-center gap-0.5 border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<ChevronLeft class="h-3 w-3" />
					Prev
				</button>
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p (p)}
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
					class="flex items-center gap-0.5 border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Next
					<ChevronRight class="h-3 w-3" />
				</button>
			</div>
		{/if}
	{/if}
</div>
