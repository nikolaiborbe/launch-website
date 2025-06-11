<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="bg-[#F9F9F9] h-[100dvh] overflow-y-auto overscroll-none">
  {@render children()}
</div>
