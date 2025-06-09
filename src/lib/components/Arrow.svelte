<script lang="ts">
  let { direction = 1 } = $props();
</script>

{#if direction === 1}
  <svg
    fill="#000000"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="10px"
    height="10px"
    viewBox="0 0 123.959 123.959"
    xml:space="preserve"
  >
    <g>
      <path
        d="M85.742,1.779l-56,56c-2.3,2.3-2.3,6.1,0,8.401l56,56c3.801,3.8,10.2,1.1,10.2-4.2v-112
		C95.942,0.679,89.543-2.021,85.742,1.779z"
      />
    </g>
  </svg>
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="10"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    image-rendering="optimizeQuality"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 336 511.461"
  >
    <path
      fill="black"
      fill-rule="nonzero"
      d="M.01 42.428L0 469.006c0 23.436 19.02 42.455 42.455 42.455 11.058 0 21.128-4.226 28.69-11.158l249.486-206.432c18.041-14.914 20.558-41.655 5.644-59.696a44.464 44.464 0 00-4.825-4.965L70.316 10.422C52.654-4.962 25.833-3.094 10.459 14.567 3.456 22.609.02 32.538.01 42.428z"
    />
  </svg>
{/if}
