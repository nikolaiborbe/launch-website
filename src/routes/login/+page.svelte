<script lang="ts">
	let data: { incorrect?: boolean } = $props();
</script>

<div class="w-screen h-screen bg-slate-50 flex justify-center items-center">
	<div class="h-32 w-96 border-2 rounded-xl p-4 flex flex-col justify-between">
		<h1 class="text-2xl">Login</h1>
		<form method="POST" class="flex items-center justify-between gap-2 ">
			<input
				class="bg-black/5 px-4 py-2.5 w-full rounded-xl"
				type="password"
				name="password"
				placeholder="Enter password"
				autocomplete="current-password"
			/>

			<button
				class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>Enter</button
			>
		</form>
	</div>
</div>
