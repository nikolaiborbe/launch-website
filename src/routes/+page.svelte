<script lang="ts">
	import { onMount } from "svelte";
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import TempWidget from "$lib/components/TempWidget.svelte";
	import PropulseLogo from "$lib/icons/PropulseLogo.svelte";

	import "leaflet/dist/leaflet.css";
	import type { Map as LeafletMap } from "leaflet";
	let map: LeafletMap | null = null;

	// Dynamic flight status
	let landing = $state({ x: 0, y: 0 });
	let maxAltitude = $state(0);
	let maxSpeed = $state(0);
	let wind = $state(0);
	let time = $state(
		new Date().toLocaleString("no-NO", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "Europe/Oslo",
		})
	);

	const lat = 63.80263794391954;
	const lng = 9.413957500356199;

	// Example track (10 points) shifted ~25× farther west (oldest first, newest last)
	let points: [number, number][] = [];

	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		// Wait until the DOM re‑flows, then update the map canvas
		tick().then(() => {
			map && map.invalidateSize();
		});
	}

	/**
	 * Dynamically import Leaflet on the client and render the map.
	 */
	async function drawMap(): Promise<LeafletMap | null> {
		if (!browser) return null;
		// Dynamically load Leaflet **only** in the browser to avoid SSR issues
		const L = await import("leaflet").then((m) => m.default ?? (m as any));
		const map = L.map("map").setView([lat, lng], 13);

		// Create a layer group for the path markers
		const pathLayer = L.layerGroup().addTo(map);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(map);

		L.marker([lat, lng]).addTo(map).bindPopup("Launch site").openPopup();

		function redrawPoints() {
			pathLayer.clearLayers();
			const denom = Math.max(points.length - 1, 1);
			points.forEach((coord, idx) => {
				const t = idx / denom; // 0 = oldest, 1 = newest
				// Map oldest to yellow (60°) and newest to red (0°)
				const hue = 60 * (1 - t);
				const color = `hsl(${hue}, 100%, 50%)`;
				L.circleMarker(coord, {
					radius: 8,
					color,
					fillColor: color,
					fillOpacity: 0.8,
					weight: 1,
				}).addTo(pathLayer);
			});
		}

		// Fetch flight status every second and update landing and points
		function fetchStatus() {
			fetch("/api/status")
				.then((res) => res.json())
				.then((data) => {
					landing = data.landing;
					maxAltitude = data.max_altitude;
					maxSpeed = data.max_speed;
					wind = data.wind;
					const landingLatLng = map.containerPointToLatLng([
						landing.x,
						landing.y,
					]);
					points.push([landingLatLng.lat, landingLatLng.lng]);
					// Keep only the most recent 100 points
					if (points.length > 100) {
						points.shift();
					}
					redrawPoints();
				})
				.catch((err) => console.error("Failed to fetch status", err));
		}
		// Initial fetch and periodic updates
		fetchStatus();
		setInterval(fetchStatus, 1000);

		return map;
	}

	onMount(async () => {
		if (browser) {
			sidebarOpen = window.matchMedia("(min-width: 768px)").matches;
		}
		// Wait one rendering tick so flex layout sizes are settled
		await tick();
		map = await drawMap();
		if (map) {
			// Ensure map resizes correctly when the window size or sidebar changes
			window.addEventListener("resize", () => {
				if (map) map.invalidateSize();
			});
		}
		setInterval(() => {
			time = new Date().toLocaleString("no-NO", {
				dateStyle: "medium",
				timeStyle: "short",
				timeZone: "Europe/Oslo",
			});
		}, 1000);
	});
</script>

{#snippet box(text: string, value: string | number, icon: string = "")}
	<div class="py-4 rounded-3xl flex justify-between">
		<div>
			<img src="" alt="" />
			<p>{text}:</p>
		</div>
		<p>{value}</p>
	</div>
{/snippet}

<div class="relative flex">
	{#if sidebarOpen}
		<div class="w-96 md:w-[30rem] shadow-2xl">
			<div class="flex items-center justify-center p-6">
				<PropulseLogo width={150} height={87} color="steelblue" />
			</div>
			<div
				class="flex flex-col p-4 m-4 gap-2 bg-white rounded-xl border-2 border-slate-100 shadow-lg"
			>
				<div class="flex justify-between items-center">
					<p class="font-bold text-xl">Flight Information</p>
					<p class="text-gray-500 text-sm">
						{time}
					</p>
				</div>
				<div class="flex flex-col gap-2">
					{@render box("Landing X", landing.x.toFixed(2))}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Landing Y", landing.y.toFixed(2))}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Max Altitude", maxAltitude.toFixed(2))}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Max Speed", maxSpeed.toFixed(2))}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Wind Speed", wind.toFixed(2))}
				</div>
			</div>
		</div>
	{/if}

	<div class="relative flex-1">
		<button
			onclick={toggleSidebar}
			class="cursor-pointer hover:bg-gray-100 transition-all duration-75 absolute top-1/2 -translate-y-1/2 bg-white rounded-r-xl shadow z-[1001] flex items-center justify-center w-6 h-16"
		>
			{#if sidebarOpen}
				<span aria-hidden="true" class="text-gray-700 text-xs"
					>&#x25C0;</span
				>
				<!-- ◀ -->
			{:else}
				<span aria-hidden="true" class="text-gray-700 text-xs"
					>&#x25B6;</span
				>
				<!-- ▶ -->
			{/if}
		</button>

		<div id="map" class="flex-1"></div>
	</div>
</div>

<style>
	#map {
		flex: 1;
		min-width: 0;
		height: 100vh;
		width: 100%;
	}
</style>
