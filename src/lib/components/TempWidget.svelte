<script lang="ts">
  export let temp: number = 0;
  const min = 0;
  const max = 40;
  const radius = 100;
  const fullCircumference = 2 * Math.PI * radius;
  const arcSpan = 210; // degrees to draw (a bit more than half circle)
  const arcLength = fullCircumference * (arcSpan / 360);
  const startAngle = 270 - arcSpan / 2;
  $: clampTemp = Math.min(Math.max(temp, min), max);
  $: percentage = (clampTemp - min) / (max - min);
  $: dashOffset = arcLength * (1 - percentage);
</script>

<div class="rounded-2xl flex justify-center items-center w-40 h-40  ">
  <svg class="gauge" viewBox="0 0 220 220">
    <circle
      cx="110" cy="110" r="100"
      stroke="#eee" stroke-width="20"
      fill="none"
      stroke-linecap="round"
      stroke-dasharray={arcLength + ' ' + fullCircumference}
      transform={`rotate(${startAngle} 110 110)`}
    />
    <circle
      cx="110" cy="110" r="100"
      stroke="#4caf50" stroke-width="20"
      fill="none"
      stroke-linecap="round"
      stroke-dasharray={arcLength + ' ' + fullCircumference}
      stroke-dashoffset={dashOffset}
      transform={`rotate(${startAngle} 110 110)`}
    />
    <text
      x="110" y="110"
      text-anchor="middle"
      alignment-baseline="middle"
    >
      {clampTemp}°C
    </text>
  </svg>
</div>

<style>
	.gauge {
		width: 200px;
		height: auto;
		overflow: visible;
	}
	.gauge text {
		font-size: 32px;
		fill: #333;
	}
</style>
