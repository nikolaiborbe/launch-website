<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="bg-gray-900 w-screen h-screen">
	{@render children()}
</div>
