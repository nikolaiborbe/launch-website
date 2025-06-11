<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div
	class="bg-[#F9F9F9] overflow-y-auto overscroll-none 
            h-[100vh] h-[-webkit-fill-available]
            sm:h-[100dvh]"
>
	{@render children()}
</div>
