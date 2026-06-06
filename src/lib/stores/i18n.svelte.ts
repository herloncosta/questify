import { en } from '$lib/i18n/en';
import { pt } from '$lib/i18n/pt';

type Locale = 'en' | 'pt';

let _locale = $state<Locale>('en');

function load() {
	try {
		const stored = localStorage.getItem('locale');
		if (stored === 'en' || stored === 'pt') _locale = stored;
	} catch {
		// use default
	}
}

load();

export function getLocale() {
	return _locale;
}

export function toggleLocale() {
	_locale = _locale === 'en' ? 'pt' : 'en';
	localStorage.setItem('locale', _locale);
}

export function setLocale(locale: Locale) {
	_locale = locale;
	localStorage.setItem('locale', _locale);
}

const _t = $derived(_locale === 'en' ? en : pt);

export function getT() {
	return _t;
}
