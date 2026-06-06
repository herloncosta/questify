import type { PomodoroConfig, PomodoroType } from '$lib/types';
import { addXp, checkAchievements } from './gamification.svelte.js';

let _isRunning = $state(false);
let _timeLeft = $state(0);
let _currentType = $state<PomodoroType>('work');
let _sessionCount = $state(0);
let _intervalId: ReturnType<typeof setInterval> | null = null;

const DEFAULT_CONFIG: PomodoroConfig = {
	workDuration: 25,
	shortBreakDuration: 5,
	longBreakDuration: 15,
	sessionsBeforeLongBreak: 4
};

let _config = $state<PomodoroConfig>({ ...DEFAULT_CONFIG });

function loadConfig() {
	try {
		const stored = localStorage.getItem('pomodoro-config');
		if (stored) _config = { ..._config, ...JSON.parse(stored) };
	} catch {
		// use defaults
	}
	resetTimer();
}

function saveConfig() {
	localStorage.setItem('pomodoro-config', JSON.stringify(_config));
}

function getDuration(type: PomodoroType): number {
	switch (type) {
		case 'work':
			return _config.workDuration * 60;
		case 'short_break':
			return _config.shortBreakDuration * 60;
		case 'long_break':
			return _config.longBreakDuration * 60;
	}
}

loadConfig();

function tick() {
	if (_timeLeft <= 1) {
		completeSession();
		advanceToNext();
	} else {
		_timeLeft--;
	}
}

function completeSession() {
	if (_currentType === 'work') {
		_sessionCount++;
		addXp(15);
		checkAchievements(_sessionCount, 'pomodoro');
		if (
			typeof window !== 'undefined' &&
			'Notification' in window &&
			Notification.permission === 'granted'
		) {
			new Notification('Pomodoro complete!', { body: 'Time for a break!', icon: '/favicon.png' });
		}
	}
}

function advanceToNext() {
	pauseTimer();
	if (_currentType === 'work') {
		_currentType =
			_sessionCount % _config.sessionsBeforeLongBreak === 0 ? 'long_break' : 'short_break';
	} else {
		_currentType = 'work';
	}
	_timeLeft = getDuration(_currentType);
}

export function getIsRunning() {
	return _isRunning;
}

export function getTimeLeft() {
	return _timeLeft;
}

export function getCurrentType() {
	return _currentType;
}

export function getSessionCount() {
	return _sessionCount;
}

export function getConfig() {
	return _config;
}

export function updateConfig(updates: Partial<PomodoroConfig>) {
	_config = { ..._config, ...updates };
	saveConfig();
	if (!_isRunning) resetTimer();
}

export function startTimer() {
	if (_isRunning) return;
	_isRunning = true;
	_intervalId = setInterval(tick, 1000);
}

export function pauseTimer() {
	_isRunning = false;
	if (_intervalId) {
		clearInterval(_intervalId);
		_intervalId = null;
	}
}

export function resetTimer() {
	pauseTimer();
	_timeLeft = getDuration(_currentType);
}

export function switchType(type: PomodoroType) {
	if (_isRunning) return;
	_currentType = type;
	_timeLeft = getDuration(type);
}
