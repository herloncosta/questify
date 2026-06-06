<script lang="ts">
	import {
		getLastAchievement,
		isShowingAchievement,
		dismissAchievement,
		getPendingXp,
		consumePendingXp
	} from '$lib/stores/gamification.svelte.js';
	import { getT } from '$lib/stores/i18n.svelte.js';
	import Trophy from '@lucide/svelte/icons/trophy';

	const achievement = $derived(getLastAchievement());
	const showing = $derived(isShowingAchievement());
	const t = $derived(getT());
	let xpFloats: { id: number; x: number; amount: number }[] = $state([]);
	let idCounter = 0;

	$effect(() => {
		if (showing && achievement) {
			setTimeout(() => dismissAchievement(), 4000);
		}
	});

	$effect(() => {
		const val = getPendingXp();
		if (val > 0) {
			consumePendingXp();
			for (let i = 0; i < Math.min(val, 10); i++) {
				const id = ++idCounter;
				setTimeout(() => {
					xpFloats = [...xpFloats, { id, x: Math.random() * 160 - 80, amount: val }];
					setTimeout(() => {
						xpFloats = xpFloats.filter((f) => f.id !== id);
					}, 1200);
				}, i * 80);
			}
		}
	});
</script>

{#if showing && achievement}
	<div class="fixed top-6 right-6 z-50 animate-[achievement-pop_0.3s_ease-out]" role="alert">
		<div class="flex items-center gap-3 border border-accent/20 bg-surface-2 px-5 py-3 shadow-lg">
			<div class="flex h-10 w-10 items-center justify-center bg-accent/10 text-accent">
				<Trophy class="h-5 w-5" />
			</div>
			<div>
				<p class="text-[11px] font-semibold tracking-wider text-accent uppercase">
					{t.gamification.achievementUnlocked}
				</p>
				<p class="text-sm font-medium text-text-primary">
					{t.achievements[achievement.id]?.title || achievement.title}
				</p>
				<p class="text-xs text-text-secondary">
					{t.achievements[achievement.id]?.desc || achievement.description}
				</p>
			</div>
		</div>
	</div>
{/if}

{#each xpFloats as f (f.id)}
	<div
		class="pointer-events-none fixed bottom-24 z-50 text-sm font-bold text-accent"
		style="left: calc(50% + {f.x}px); animation: xp-float 1.2s ease-out forwards;"
	>
		+{f.amount}XP
	</div>
{/each}
