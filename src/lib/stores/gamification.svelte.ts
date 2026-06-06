import { SvelteDate } from 'svelte/reactivity';
import type { AchievementId, UserStats, Achievement } from '$lib/types';

let _stats = $state<UserStats>({
	xp: 0,
	level: 1,
	streak: 0,
	lastActiveDate: '',
	achievements: [],
	tasksCompleted: 0,
	pomodorosCompleted: 0,
	totalFocusMinutes: 0
});

let _lastAchievement = $state<Achievement | null>(null);
let _showAchievement = $state(false);
let _pendingXp = $state(0);

const STORAGE_KEY = 'gamification';

const ACHIEVEMENTS: Achievement[] = [
	{
		id: 'first-task',
		title: 'First Step',
		description: 'Complete your first task',
		icon: 'target'
	},
	{ id: 'ten-tasks', title: 'Hard Worker', description: 'Complete 10 tasks', icon: 'zap' },
	{ id: 'fifty-tasks', title: 'Task Master', description: 'Complete 50 tasks', icon: 'award' },
	{
		id: 'first-pomodoro',
		title: 'Focused',
		description: 'Complete your first pomodoro',
		icon: 'timer'
	},
	{ id: 'ten-pomodoros', title: 'In the Zone', description: 'Complete 10 pomodoros', icon: 'zap' },
	{
		id: 'fifty-pomodoros',
		title: 'Pomodoro Pro',
		description: 'Complete 50 pomodoros',
		icon: 'zap'
	},
	{
		id: 'streak-3',
		title: 'Streak Starter',
		description: 'Maintain a 3-day streak',
		icon: 'flame'
	},
	{ id: 'streak-7', title: 'Streak Keeper', description: 'Maintain a 7-day streak', icon: 'flame' },
	{
		id: 'streak-30',
		title: 'Streak Warrior',
		description: 'Maintain a 30-day streak',
		icon: 'flame'
	},
	{ id: 'prioritizer', title: 'Prioritizer', description: 'Use priorities on tasks', icon: 'flag' }
];

function load() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) _stats = { ..._stats, ...JSON.parse(stored) };
	} catch {
		// use defaults
	}
}

function save() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(_stats));
}

load();

function recalcLevel() {
	_stats.level = Math.max(1, Math.floor(Math.sqrt(_stats.xp / 100)) + 1);
}

export function getStats() {
	return _stats;
}

export function addXp(amount: number) {
	_stats.xp += amount;
	_pendingXp += amount;
	recalcLevel();
	save();
}

export function getXpProgress() {
	const lvl = _stats.level;
	const currentLevelXp = (lvl - 1) ** 2 * 100;
	const nextLevelXp = lvl ** 2 * 100;
	const xpInLevel = _stats.xp - currentLevelXp;
	const xpNeeded = nextLevelXp - currentLevelXp;
	return {
		current: xpInLevel,
		max: xpNeeded,
		percent: xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100
	};
}

export function getPendingXp() {
	return _pendingXp;
}

export function consumePendingXp() {
	const val = _pendingXp;
	_pendingXp = 0;
	return val;
}

export function getLastAchievement() {
	return _lastAchievement;
}

export function isShowingAchievement() {
	return _showAchievement;
}

export function dismissAchievement() {
	_showAchievement = false;
	_lastAchievement = null;
}

export function updateStreak() {
	const today = new SvelteDate().toISOString().split('T')[0];
	if (_stats.lastActiveDate === today) return;
	const yesterday = new SvelteDate(Date.now() - 86400000).toISOString().split('T')[0];
	if (_stats.lastActiveDate === yesterday) {
		_stats.streak++;
		if (_stats.streak === 3) unlockAchievement('streak-3');
		if (_stats.streak === 7) unlockAchievement('streak-7');
		if (_stats.streak === 30) unlockAchievement('streak-30');
		if (_stats.streak >= 3) addXp(10 * Math.min(_stats.streak, 10));
	} else if (_stats.lastActiveDate !== today) {
		_stats.streak = 1;
	}
	_stats.lastActiveDate = today;
	save();
}

function getAchievementXp(id: AchievementId): number {
	const rewards: Record<AchievementId, number> = {
		'first-task': 100,
		'ten-tasks': 200,
		'fifty-tasks': 500,
		'first-pomodoro': 100,
		'ten-pomodoros': 200,
		'fifty-pomodoros': 500,
		'streak-3': 150,
		'streak-7': 300,
		'streak-30': 1000,
		prioritizer: 50
	};
	return rewards[id] || 0;
}

export function unlockAchievement(id: AchievementId) {
	if (_stats.achievements.includes(id)) return;
	_stats.achievements = [..._stats.achievements, id];
	const a = ACHIEVEMENTS.find((x) => x.id === id);
	if (a) {
		_lastAchievement = a;
		_showAchievement = true;
		setTimeout(() => {
			_showAchievement = false;
		}, 4000);
		addXp(getAchievementXp(id));
	}
	save();
}

export function checkAchievements(count: number, type: 'task' | 'pomodoro') {
	if (type === 'task') {
		_stats.tasksCompleted = count;
		if (count >= 1) unlockAchievement('first-task');
		if (count >= 10) unlockAchievement('ten-tasks');
		if (count >= 50) unlockAchievement('fifty-tasks');
	} else {
		_stats.pomodorosCompleted = count;
		if (count >= 1) unlockAchievement('first-pomodoro');
		if (count >= 10) unlockAchievement('ten-pomodoros');
		if (count >= 50) unlockAchievement('fifty-pomodoros');
	}
	save();
}

export function getAchievements() {
	return ACHIEVEMENTS.map((a) => ({
		...a,
		unlocked: _stats.achievements.includes(a.id)
	}));
}

export function recordFocusMinutes(minutes: number) {
	_stats.totalFocusMinutes += minutes;
	save();
}
