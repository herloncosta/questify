let _theme = $state<'light' | 'dark'>('dark');

function load() {
	try {
		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark') _theme = stored;
	} catch {
		// use default
	}
}

load();

export function getTheme() {
	return _theme;
}

export function toggleTheme() {
	_theme = _theme === 'dark' ? 'light' : 'dark';
	localStorage.setItem('theme', _theme);
}

export function setTheme(theme: 'light' | 'dark') {
	_theme = theme;
	localStorage.setItem('theme', _theme);
}
