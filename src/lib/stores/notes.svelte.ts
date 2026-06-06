import type { Note } from '$lib/types';

let _notes = $state<Note[]>([]);
let _loaded = $state(false);

const KEY = 'notes';

function save() {
	localStorage.setItem(KEY, JSON.stringify(_notes));
}

function load() {
	try {
		const stored = localStorage.getItem(KEY);
		if (stored) _notes = JSON.parse(stored);
	} catch {
		_notes = [];
	}
	_loaded = true;
}

load();

export function getNotes() {
	return _notes;
}

export function isLoading() {
	return !_loaded;
}

export function addNote(title: string, content = ''): Note {
	const now = Date.now();
	const note: Note = {
		id: crypto.randomUUID(),
		title: title.trim(),
		content,
		createdAt: now,
		updatedAt: now
	};
	_notes = [note, ..._notes];
	save();
	return note;
}

export function updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) {
	_notes = _notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
	save();
}

export function deleteNote(id: string) {
	_notes = _notes.filter((n) => n.id !== id);
	save();
}
