import type { Task, Priority, TaskStatus } from '$lib/types';
import { addXp, checkAchievements, updateStreak } from './gamification.svelte.js';

let _tasks = $state<Task[]>([]);
let _loaded = $state(false);

const KEY = 'tasks';

function save() {
	localStorage.setItem(KEY, JSON.stringify(_tasks));
}

function load() {
	try {
		const stored = localStorage.getItem(KEY);
		if (stored) _tasks = JSON.parse(stored);
	} catch {
		_tasks = [];
	}
	_loaded = true;
}

load();

export function getTasks() {
	return _tasks;
}

export function isLoading() {
	return !_loaded;
}

export function addTask(title: string, priority: Priority = 'medium', category = ''): Task {
	const task: Task = {
		id: crypto.randomUUID(),
		title: title.trim(),
		description: '',
		completed: false,
		priority,
		category,
		createdAt: Date.now(),
		status: 'todo',
		order: _tasks.length
	};
	_tasks = [..._tasks, task];
	save();
	return task;
}

export function updateTask(id: string, updates: Partial<Task>) {
	_tasks = _tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
	save();
}

export function deleteTask(id: string) {
	_tasks = _tasks.filter((t) => t.id !== id);
	save();
}

export function toggleTask(id: string) {
	const task = _tasks.find((t) => t.id === id);
	if (!task) return;
	const now = Date.now();
	const completed = !task.completed;
	_tasks = _tasks.map((t) =>
		t.id === id
			? {
					...t,
					completed,
					completedAt: completed ? now : undefined,
					status: completed ? 'done' : 'todo'
				}
			: t
	);
	save();
	updateStreak();
	if (completed) {
		const bonus = task.priority === 'high' ? 10 : task.priority === 'medium' ? 5 : 0;
		addXp(25 + bonus);
		checkAchievements(_tasks.filter((t) => t.completed).length, 'task');
	}
}

export function moveTask(taskId: string, newStatus: TaskStatus, newOrder: number) {
	const now = Date.now();
	const completed = newStatus === 'done';
	_tasks = _tasks.map((t) =>
		t.id === taskId
			? {
					...t,
					status: newStatus,
					order: newOrder,
					completed,
					completedAt: completed ? now : undefined
				}
			: t
	);
	save();
}

export function reorderTasks(tasks: Task[]) {
	_tasks = tasks.map((t, i) => ({ ...t, order: i }));
	save();
}

export function getTasksByStatus(status: TaskStatus) {
	return _tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
}
