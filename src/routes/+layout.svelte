<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="bg-[#F9F9F9]  overflow-auto overscroll-none">
	{@render children()}
</div>
