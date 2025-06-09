<script lang="ts">
  let {direction = 0, speed = 0} = $props()


</script>

<div class="p-4 bg-white rounded-xl border-2 border-slate-100 shadow-lg">
  <div class="container">
    <!-- Arrow wrapper -->
    <div class="arrow-box">
      <svg
        class="wind-arrow"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Wind direction {direction}"
        style="transform: rotate({direction-180}deg);"
      >
        <!-- Shaft -->
        <line
          x1="12"
          y1="20"
          x2="12"
          y2="4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- Head -->
        <polyline
          points="6,10 12,4 18,10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Display direction and speed -->
    <div class="text-center text-nowrap text-lg font-bold">
      <p>{(direction - 180 + 360) % 360}°</p>
      <p>{speed} m/s</p>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    gap: 12px; /* space between arrow and text */
    font-family: sans-serif;
  }

  .arrow-box {
    display: flex;
    align-items: center;
    justify-content: center; /* center svg inside this box */
    width: 70px;
    height: 70px;
    border-radius: 0.5rem; /* round corners */
  }

  .wind-arrow {
    width: 50%;
    height: 50%;
    transition: transform 0.2s ease;
    transform-origin: 50% 50%; /* ensure rotation pivots around center */
  }

  .wind-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .direction {
    font-weight: bold;
    color: #1e293b; /* slate-800 */
  }

  .speed {
    font-size: 0.9em;
    color: #475569; /* slate-600 */
  }
</style>
