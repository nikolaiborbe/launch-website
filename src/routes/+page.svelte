<script lang="ts">
	/* component & lib imports ------------------------------------------ */
	import WindDirection from "./../lib/components/WindDirection.svelte";
	import type { Data, Day } from "../types";
	import { onMount, tick } from "svelte";
	import { browser } from "$app/environment";
	import TempWidget from "$lib/components/TempWidget.svelte";
	import PropulseLogo from "$lib/icons/PropulseLogo.svelte";
	import "leaflet/dist/leaflet.css";
	import type { Map as LeafletMap } from "leaflet";
	import Arrow from "$lib/components/Arrow.svelte";
	import DayPicker from "$lib/components/DayPicker.svelte";

	/* ------------------------------------------------------------------ */
	/* state                                                              */
	/* ------------------------------------------------------------------ */
	let map: LeafletMap | null = null;
	let updateDay: (d: number) => void = () => {}; // set inside drawMap()

	let current_landing_coords = $state<[number, number]>([0, 0]);
	let time = $state(
		new Date().toLocaleString("no-NO", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "Europe/Oslo",
		}),
	);
	let data: Day | undefined = $state();
	let display_day = $state(0);

	const lat = 63.78679038026243;
	const lng = 9.363081129686245;

	/* ------------------------------------------------------------------ */
	/* sidebar toggling                                                   */
	/* ------------------------------------------------------------------ */
	let sidebarOpen = $state(false);
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		tick().then(() => map?.invalidateSize());
	}
	$effect(() => {
		if (browser)
			window.localStorage.setItem("sidebarOpen", String(sidebarOpen));
	});

	/* ------------------------------------------------------------------ */
	/* helpers                                                            */
	/* ------------------------------------------------------------------ */
	function offset_to_coords(
		ori_lat: number,
		ori_lon: number,
		offset_x: number,
		offset_y: number,
	): [number, number] {
		const R = 6371e3;
		const lat = ori_lat + (offset_y / R) * (180 / Math.PI);
		const lon =
			ori_lon +
			((offset_x / R) * (180 / Math.PI)) / Math.cos((ori_lat * Math.PI) / 180);
		return [lat, lon];
	}

	/* ------------------------------------------------------------------ */
	/* main: create the map once, expose updateDay()                      */
	/* ------------------------------------------------------------------ */
	async function drawMap(): Promise<LeafletMap | null> {
		if (!browser) return null;

		const L = await import("leaflet").then((m) => m.default ?? (m as any));
		const map = L.map("map").setView([lat, lng], 13);
		const pathLayer = L.layerGroup().addTo(map);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(map);

		/* launch-site blue dot ------------------------------------------ */
		const blueDotIcon = L.divIcon({
			className: "",
			html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
               <circle cx="8" cy="8" r="6" fill="#3388ff" stroke="#fff" stroke-width="2"/>
             </svg>`,
			iconSize: [16, 16],
			iconAnchor: [8, 8],
			popupAnchor: [0, -8],
		});

		const xHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">
  <path d="M4 4 L16 16 M16 4 L4 16"
        stroke="#d00" stroke-width="3" stroke-linecap="round"/>
</svg>`;

		const xIcon = L.divIcon({
			className: "",
			html: xHTML,
			iconSize: [20, 20],
			iconAnchor: [10, 10],
			popupAnchor: [0, -10],
		});

		L.marker([lat, lng], { icon: blueDotIcon })
			.addTo(map)
			.openPopup()
			.bindPopup("Launch site");

		/* draws full path + key markers for one day --------------------- */
		function drawMarkers(dayData: Day) {
			pathLayer.clearLayers();

			/* 1️⃣  normalise position → flat [[dx,dy,dz], …] ------------- */
			let pointsRaw: unknown = dayData.data.flight_data.coords;
			let triples: [number, number, number][] = [];

			if (
				Array.isArray(pointsRaw) &&
				pointsRaw.length > 0 &&
				Array.isArray(pointsRaw[0][0])
			) {
				// nested depth-3 → flatten one level
				triples = (pointsRaw as [number, number, number][][]).flat();
			} else {
				triples = pointsRaw as [number, number, number][];
			}

			if (!triples.length) {
				console.warn("No trajectory points in day data");
				return;
			}

			const latlngs = dayData.data.flight_data.coords.map(
				([dx, dy]) => offset_to_coords(lat, lng, dx, dy) as [number, number],
			);

			const line = L.polyline(latlngs, {
				color: "#d00",
				weight: 3,
				renderer: L.canvas(),
			}).addTo(pathLayer);

			if (latlngs.length > 1) {
				map?.fitBounds(line.getBounds(), { padding: [50, 50] });
			}

			/* 3️⃣  landing & apogee markers ------------------------------ */
			const landing = offset_to_coords(
				lat,
				lng,
				dayData.data.impact_x,
				dayData.data.impact_y,
			);
			const apogee = offset_to_coords(
				lat,
				lng,
				dayData.data.apogee_x,
				dayData.data.apogee_y,
			);

			L.marker(landing, { icon: xIcon })
				.addTo(pathLayer)
				.bindPopup(
					`Splash-down (${landing[0].toFixed(7)}, ${landing[1].toFixed(7)})`,
				);

			L.circleMarker(apogee, {
				radius: 4,
				color: "#000",
				fillColor: "#ff0",
				fillOpacity: 0.8,
				weight: 1,
			})
				.addTo(pathLayer)
				.bindPopup(`Apogee (${apogee[0].toFixed(7)}, ${apogee[1].toFixed(7)})`);

			current_landing_coords = landing;
		}

		/* -------------------------------------------------------------- */
		/* keep the last /api/status payload so we can redraw instantly   */
		/* -------------------------------------------------------------- */
		let days: Data | null = null;

		async function fetchStatus() {
			try {
				const res = await fetch("/api/status");
				if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
				days = (await res.json()) as Data;
				updateDay(display_day); // redraw active day
			} catch (e) {
				console.error("Failed to fetch status", e);
			}
		}

		/* expose updateDay --------------------------------------------- */
		updateDay = (day: number) => {
			if (!days) return;
			const d = days[day];
			if (d) {
				data = d;
				drawMarkers(d);
			}
		};

		await fetchStatus(); // first load
		setInterval(fetchStatus, 25_000); // refresh

		return map;
	}

	/* ------------------------------------------------------------------ */
	/* button handlers                                                    */
	/* ------------------------------------------------------------------ */
	function handleLeftClick() {
		if (display_day > 0) {
			display_day--;
			updateDay(display_day);
		}
	}
	function handleRightClick() {
		if (display_day < 5) {
			display_day++;
			updateDay(display_day);
		}
	}

	/* ------------------------------------------------------------------ */
	/* mount                                                              */
	/* ------------------------------------------------------------------ */
	onMount(async () => {
		if (browser) {
			sidebarOpen = window.matchMedia("(min-width: 768px)").matches;
		}
		await tick(); // ensure #map has dimensions
		map = await drawMap();
		window.addEventListener("resize", () => map?.invalidateSize());

		/* live clock --------------------------------------------------- */
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

<div class="relative flex text-sm md:text-base h-[100dvh]">
	{#if sidebarOpen}
		<div
			class="w-82 md:w-[30rem] shadow-2xl overflow-auto h-[100dvh] pb-20 touch-pan-y"
		>
			<div class="flex items-center justify-center p-6">
				<a href="https://www.propulse.no/" target="_blank">
					<PropulseLogo width={150} height={87} color="steelblue" />
				</a>
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
					{@render box(
						"Max Speed",
						data!.data.max_velocity.toFixed(2) + " m/s",
					)}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box(
						"Max Altitude",
						data!.data.apogee_altitude.toFixed(2) + " m",
					)}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box("Apogee Time", data!.data.apogee_time.toFixed(2) + " s")}
					<div class="w-full h-[1px] bg-gray-200"></div>
					{@render box(
						"Impact Velocity",
						data!.data.impact_velocity.toFixed(2) + " m/s",
					)}
					<!-- {@render box("Wind Speed", wind.toFixed(2))} -->
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4 m-4">
				{#if !data}
					<div
						class="self-center w-full flex flex-col items-center p-4 gap-2 bg-white rounded-xl border-2 border-slate-100 shadow-lg"
					>
						<p class="text-gray-500">Loading wind data...</p>
					</div>
					<div
						class="self-center w-full flex flex-col items-center p-4 gap-2 bg-white rounded-xl border-2 border-slate-100 shadow-lg"
					>
						<p class="text-gray-500">Loading temp data...</p>
					</div>
				{:else}
					<WindDirection
						direction={data!.weather.wind_from_direction}
						speed={data!.weather.wind_speed}
					/>
					<TempWidget temp={data!.weather.temperature} />
				{/if}

				<div class="col-span-2">
					<DayPicker {display_day} {handleLeftClick} {handleRightClick} />
				</div>
			</div>
		</div>
	{/if}

	<div class="relative flex-1 h-[100dvh]">
		<button
			onclick={toggleSidebar}
			class="cursor-pointer hover:bg-gray-100 transition-all duration-75
						 absolute top-1/2 -translate-y-1/2 bg-white rounded-r-xl shadow
						 z-[1001] flex items-center justify-center w-6 h-16 touch-pan-y"
		>
			{#if sidebarOpen}
				<Arrow direction={1} />
			{:else}
				<Arrow direction={0} />
			{/if}
		</button>

		<!-- the map itself -->
		<div id="map" class="flex-1 h-[100dvh]"></div>
	</div>
</div>

<style>
	.no-scroll {
		overflow: hidden;
		height: 100%;
	}
	#map {
		flex: 1;
		min-width: 0;
		height: 100dvh;
		height: -webkit-fill-available;
		width: 100%;
	}
	@supports not (height: 100dvh) {
		/* very old browsers fall back to full vh */
		#map {
			height: 100vh;
		}
	}
</style>
