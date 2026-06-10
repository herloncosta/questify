<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet-draw/dist/leaflet.draw.css';
	import { getT } from '$lib/stores/i18n.svelte.js';
	import type L from 'leaflet';

	const STORAGE_KEY = 'questify-map';

	const t = $derived(getT());

	let mapContainer: HTMLDivElement;
	let map: L.Map | undefined;
	let drawnItems: L.FeatureGroup | undefined;

	let _L: typeof L;

	onMount(async () => {
		_L = (await import('leaflet')).default as typeof L;
		await import('leaflet-draw');

		delete (_L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
		_L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		map = _L.map(mapContainer, {
			center: [-14.235, -51.9253],
			zoom: 4,
			zoomControl: true
		});

		_L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19
		}).addTo(map!);

		drawnItems = new _L.FeatureGroup();
		map!.addLayer(drawnItems);

		const drawControl = new _L.Control.Draw({
			edit: { featureGroup: drawnItems },
			draw: {
				polygon: {},
				polyline: {},
				rectangle: {},
				circle: {},
				marker: {}
			}
		});
		map!.addControl(drawControl);

		loadFeatures();

		map!.on('draw:created', ((event: L.DrawEvents.Created) => {
			drawnItems?.addLayer(event.layer);
			saveFeatures();
		}) as L.LeafletEventHandlerFn);

		map!.on('draw:edited', () => {
			saveFeatures();
		});

		map!.on('draw:deleted', () => {
			saveFeatures();
		});
	});

	onDestroy(() => {
		map?.remove();
	});

	function saveFeatures() {
		if (!drawnItems) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(drawnItems.toGeoJSON()));
	}

	function loadFeatures() {
		if (!drawnItems || !_L) return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const geojson = JSON.parse(raw);
			if (!geojson?.features?.length) return;
			const layer = _L.geoJSON(geojson, {
				pointToLayer: (_feature: GeoJSON.Feature, latlng: L.LatLng) => _L.marker(latlng)
			});
			layer.eachLayer((l: L.Layer) => drawnItems?.addLayer(l));
		} catch {
			console.error('Failed to load map data');
		}
	}

	function clearAll() {
		drawnItems?.clearLayers();
		saveFeatures();
	}
</script>

<div class="flex h-full flex-col gap-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold text-text-primary">{t.map.title}</h2>
		<button
			onclick={clearAll}
			class="cursor-pointer rounded-md bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
		>
			{t.map.clearAll}
		</button>
	</div>
	<div bind:this={mapContainer} class="min-h-0 flex-1 rounded-lg border border-surface-3"></div>
</div>
