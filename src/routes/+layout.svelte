<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="overscroll-contain snap-start snap-mandatory ">
	{@render children()}
</div>
