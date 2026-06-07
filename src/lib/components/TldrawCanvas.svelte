<script lang="ts">
	import { onMount } from 'svelte';

	const PERSISTENCE_KEY = 'questify-diagram';

	// svelte-ignore non_reactive_update
	let container: HTMLDivElement;
	let errorMsg: string | null = $state(null);

	onMount(() => {
		let cancelled = false;
		let root: { unmount: () => void; render: (el: unknown) => void } | null = null;

		(async () => {
			try {
				const { createRoot } = await import('react-dom/client');
				const React = await import('react');
				const { Tldraw, loadSnapshot, getSnapshot, createTLStore } = await import('tldraw');
				await import('tldraw/tldraw.css');

				if (cancelled) return;

				const store = createTLStore({ defaultName: 'Diagram' });

				try {
					const saved = localStorage.getItem(PERSISTENCE_KEY);
					if (saved) loadSnapshot(store, JSON.parse(saved));
				} catch {
					// no saved data
				}

				const el = React.createElement(Tldraw, {
					store,
					hideUi: false,
					autoFocus: true,
					onMount: () => {
						const unsubscribe = store.listen((entry: { source?: string }) => {
							if (entry.source === 'user') {
								const snapshot = getSnapshot(store);
								localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot));
							}
						});
						return () => unsubscribe();
					}
				});

				root = createRoot(container) as unknown as typeof root;
				root!.render(el);
			} catch (e) {
				console.error('TldrawCanvas: failed to mount', e);
				errorMsg = 'Failed to load diagram editor.';
			}
		})();

		return () => {
			cancelled = true;
			root?.unmount();
		};
	});
</script>

{#if errorMsg}
	<div class="flex h-full items-center justify-center">
		<p class="text-sm text-danger">{errorMsg}</p>
	</div>
{:else}
	<div bind:this={container} class="h-full w-full"></div>
{/if}
