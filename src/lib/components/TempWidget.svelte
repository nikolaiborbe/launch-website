<script lang="ts">
  let { temp = 0 } = $props<{ temp: number }>();
</script>

<div class="p-4 rounded-xl border-2 border-slate-100 shadow-lg h-full ">
  <div class="temp-widget  h-full">
    <div class="temp-value text-4xl font-bold flex  h-full items-center justify-center  ">
      {temp}°C
    </div>
  </div>
</div>
