<script lang="ts">
  import Arrow from "./Arrow.svelte";
  let { display_day, handleLeftClick, handleRightClick } = $props();
  let days = ["Now", "1h", "2h", "Tomorrow", "2d", "3d"];
</script>

<div
  class=" bg-white rounded-xl border-2 border-slate-100 shadow-lg flex justify-between"
>
  <button
    class="cursor-pointer px-6 bg-gray-100 hover:bg-gray-200 transition-all rounded-l-lg"
    aria-label="left"
    onclick={handleLeftClick}><Arrow direction={1} /></button
  >
  <h1 class="p-4 text-xl">{days[display_day]}</h1>
  <button
    aria-label="right"
    class=" cursor-pointer px-6 bg-gray-100 hover:bg-gray-200 transition-all rounded-r-lg"  
    onclick={handleRightClick}
  >
    <div>
      <Arrow direction={0} />
    </div>
  </button>
</div>
