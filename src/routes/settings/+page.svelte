<!-- RocketSettings.svelte  – Svelte 5 + runes -->
<script lang="ts">
  import type { Settings } from "../../types";

  const defaultParams = {
    fuel_mass: 500, // kg - place sensible defaults here
    length: 15, // m
    wind_direction: 0, // degrees
  } satisfies Settings;

  let settings: Settings = { ...defaultParams };

  const typeOf = (v: unknown) => (typeof v === "number" ? "number" : "text");
  const label = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
</script>

<div class="w-screen h-screen bg-slate-50/50 flex justify-center items-center">
  <form
    class="h-fit w-96 border-slate-100 shadow-xl rounded-xl p-4 flex flex-col gap-4 bg-white "
    onsubmit={() => console.log("submit", settings)}
  >
    <h1 class="mb-2 text-xl font-bold">Settings</h1>

    {#each Object.entries(settings) as [key, value] (key)}
      <label class="flex justify-between items-center gap-2">
        <span class="">{label(key)}</span>

        <input
          type={typeOf(value)}
          class="w-32 rounded bg-black/5 px-2 py-1 text-right focus:ring"
          {value}
          oninput={(e) => {
            const v = (e.target as HTMLInputElement).value;
            (settings as any)[key] = typeOf(value) === "number" ? Number(v) : v;
          }}
        />
      </label>
    {/each}

    <button
      type="submit"
      class="mt-6 text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-gray-600 dark:hover:bg-gray-700 cursor-pointer focus:outline-none dark:focus:ring-gray-800 transition-all"
    >
      Save
    </button>
  </form>
</div>
