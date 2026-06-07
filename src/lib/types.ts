export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type PomodoroType = 'work' | 'short_break' | 'long_break';

export interface Task {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	priority: Priority;
	category: string;
	createdAt: number;
	completedAt?: number;
	status: TaskStatus;
	order: number;
}

export interface PomodoroConfig {
	workDuration: number;
	shortBreakDuration: number;
	longBreakDuration: number;
	sessionsBeforeLongBreak: number;
}

export type AchievementId =
	| 'first-task'
	| 'ten-tasks'
	| 'fifty-tasks'
	| 'first-pomodoro'
	| 'ten-pomodoros'
	| 'fifty-pomodoros'
	| 'streak-3'
	| 'streak-7'
	| 'streak-30'
	| 'prioritizer';

export interface Achievement {
	id: AchievementId;
	title: string;
	description: string;
	icon: string;
}

export interface UserStats {
	xp: number;
	level: number;
	streak: number;
	lastActiveDate: string;
	achievements: AchievementId[];
	tasksCompleted: number;
	pomodorosCompleted: number;
	totalFocusMinutes: number;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	createdAt: number;
	updatedAt: number;
}

export type View = 'dashboard' | 'todo' | 'pomodoro' | 'kanban' | 'notes' | 'diagrams';
