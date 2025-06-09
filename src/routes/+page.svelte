<script lang="ts">
	import WindDirection from "./../lib/components/WindDirection.svelte";
	import type { Data } from "../types";
	import { onMount } from "svelte";
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import TempWidget from "$lib/components/TempWidget.svelte";
	import PropulseLogo from "$lib/icons/PropulseLogo.svelte";

	import "leaflet/dist/leaflet.css";
	import type { Map as LeafletMap } from "leaflet";
	import Arrow from "$lib/components/Arrow.svelte";
	let map: LeafletMap | null = null;

	let current_landing_coords = $state<[number, number]>([0, 0]);

	// Dynamic flight status
	let time = $state(
		new Date().toLocaleString("no-NO", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "Europe/Oslo",
		}),
	);
	let data: Data | undefined = $state();

	const lat = 63.78679038026243;
	const lng = 9.363081129686245;

	// Example track (10 points) shifted ~25× farther west (oldest first, newest last)
	let points: [number, number][] = [];
	let max_points: [number, number][] = [];

	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		// Wait until the DOM re‑flows, then update the map canvas
		tick().then(() => {
			map && map.invalidateSize();
		});
	}

	function offset_to_coords(
		ori_lat: number,
		ori_lon: number,
		offset_x: number,
		offset_y: number,
	): [number, number] {
		const R = 6371e3; // Earth radius in meters
		const lat = ori_lat + (offset_y / R) * (180 / Math.PI);
		const lon =
			ori_lon +
			((offset_x / R) * (180 / Math.PI)) / Math.cos((ori_lat * Math.PI) / 180);
		return [lat, lon];
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

		const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
  <circle
    cx="8" cy="8" r="6"
    fill="#3388ff"
    stroke="#ffffff"
    stroke-width="2"
  />
</svg>`;

		// 2. Wrap it in a DivIcon
		const blueDotIcon = L.divIcon({
			className: "", // no extra wrapper styles
			html: svgString, // our inline circle
			iconSize: [16, 16], // match the SVG viewport
			iconAnchor: [8, 8], // center the circle on the lat/lng
			popupAnchor: [0, -8], // pop-up just above the dot
		});

		// 3. Drop it onto the map
		L.marker([lat, lng], { icon: blueDotIcon })
			.addTo(map)
			.bindPopup("Launch site")
			.openPopup();

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
				})
					.addTo(pathLayer)
					.bindPopup(
						"#" +
							idx +
							": Max apogee point " +
							" (" +
							coord[0].toFixed(7) +
							", " +
							coord[1].toFixed(7) +
							") ",
					);
			});

			max_points.forEach((coord, index) => {
				// Map oldest to yellow (60°) and newest to red (0°)
				//color yellow

				const t = index / denom; // 0 = oldest, 1 = newest
				const hue = 60 * (1 - t);
				const color = `hsl(${hue}, 100%, 50%)`;
				L.circleMarker(coord, {
					radius: 4,
					color: "black",
					fillColor: color,
					fillOpacity: 0.8,
					weight: 1,
				})
					.addTo(pathLayer)
					.bindPopup(
						"#" +
							index +
							": Max apogee point " +
							" (" +
							coord[0].toFixed(7) +
							", " +
							coord[1].toFixed(7) +
							") ",
					);
			});
		}

		// Fetch flight status every second and update landing and points
		async function fetchStatus() {
			try {
				const res = await fetch("/api/status"); // or '/api/status'
				if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
				data = (await res.json()) as Data;

				// update your points array
				const landing_coords = offset_to_coords(
					lat,
					lng,
					data[0].impact_x,
					data[0].impact_y,
				);
				const max_apogee_coords = offset_to_coords(
					lat,
					lng,
					data[0].apogee_x,
					data[0].apogee_y,
				);
				current_landing_coords = landing_coords;
				points.push(landing_coords);
				if (points.length > 100) points.shift();
				max_points.push(max_apogee_coords);
				if (max_points.length > 100) max_points.shift();

				redrawPoints();
			} catch (err) {
				console.error("Failed to fetch status", err);
			}
		}
		// Initial fetch and periodic updates
		fetchStatus();
		fetchStatus();
		setInterval(fetchStatus, 60000);

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

{#snippet box(text: string, value: string | number)}
	<div class="py-4 rounded-3xl flex justify-between">
		<div>
			<img src="" alt="" />
			<p>{text}:</p>
		</div>
		{#if !data}
			Loading...
		{:else}
			<p>{value}</p>
		{/if}
	</div>
{/snippet}

<div class="relative flex text-sm md:text-base">
	{#if sidebarOpen}
		<div class="w-82 md:w-[30rem] shadow-2xl">
			<div class="flex items-center justify-center p-6">
				<PropulseLogo width={150} height={87} color="steelblue" />
			</div>
			<div
				class="flex flex-col p-4 m-4 gap-2 bg-white rounded-xl border-2 border-slate-100 shadow-lg"
			>
				<div class="flex justify-between items-center">
					<p class="font-bold text-base md:text-xl">Flight Information</p>
					<p class="text-gray-500 text-xs md:text-sm">
						{time}
					</p>
				</div>

				<div class="flex flex-col gap-2">
					{@render box("Landing X", current_landing_coords[0].toFixed(7) + "°")}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Landing Y", current_landing_coords[1].toFixed(7) + "°")}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Max Speed", data![0].max_velocity.toFixed(2) + " m/s")}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box(
						"Max Altitude",
						data![0].apogee_altitude.toFixed(2) + " m",
					)}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Apogee Time", data![0].apogee_time.toFixed(2) + " s")}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box(
						"Impact Velocity",
						data![0].impact_velocity.toFixed(2) + " m/s",
					)}
					<!-- {@render box("Wind Speed", wind.toFixed(2))} -->
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4 m-4">
				{#if !data}
					<div
						class="self-center w-full flex flex-col items-center p-4 gap-2 bg-white rounded-xl border-2 border-slate-100 shadow-lg"
					>
						<p class="text-gray-500">Loading weather data...</p>
					</div>
				{:else}
					<WindDirection
						direction={data![1].wind_direction}
						speed={data![1].wind_speed}
					/>
					<TempWidget temp={data![1].temperature} />
				{/if}
			</div>
		</div>
	{/if}

	<div class="relative flex-1">
		<button
			onclick={toggleSidebar}
			class="cursor-pointer hover:bg-gray-100 transition-all duration-75 absolute top-1/2 -translate-y-1/2 bg-white rounded-r-xl shadow z-[1001] flex items-center justify-center w-6 h-16"
		>
			{#if sidebarOpen}
				<Arrow direction={1} />
			{:else}
				<Arrow direction={0} />
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
