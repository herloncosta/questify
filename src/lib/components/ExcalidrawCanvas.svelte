<script lang="ts">
	import { onMount } from 'svelte';
	import { get, set } from 'idb-keyval';

	const PERSISTENCE_KEY = 'questify-diagram';

	// svelte-ignore non_reactive_update
	let container: HTMLDivElement;
	let errorMsg: string | null = $state(null);

	onMount(() => {
		let cancelled = false;
		let root: { unmount: () => void; render: (el: unknown) => void } | null = null;
		let saveTimer: ReturnType<typeof setTimeout> | null = null;

		(async () => {
			try {
				const [saved, { createRoot }, React, { Excalidraw }] = await Promise.all([
					get(PERSISTENCE_KEY) as Promise<Record<string, unknown> | undefined>,
					import('react-dom/client'),
					import('react'),
					import('@excalidraw/excalidraw')
				]);
				await import('@excalidraw/excalidraw/index.css');

				if (cancelled) return;

				const el = React.createElement(Excalidraw, {
					autoFocus: true,
					initialData: (saved as never) ?? null,
					onChange: (elements: unknown, appState: unknown) => {
						if (saveTimer) clearTimeout(saveTimer);
						saveTimer = setTimeout(() => {
							set(PERSISTENCE_KEY, { elements, appState }).catch(() => {});
						}, 500);
					}
				});

				root = createRoot(container) as unknown as typeof root;
				root!.render(el);
			} catch (e) {
				console.error('ExcalidrawCanvas: failed to mount', e);
				errorMsg = 'Failed to load diagram editor.';
			}
		})();

		return () => {
			cancelled = true;
			if (saveTimer) clearTimeout(saveTimer);
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
