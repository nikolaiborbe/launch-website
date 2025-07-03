<script lang="ts">
	let data: { incorrect?: boolean } = $props();
</script>

<div class="w-screen h-screen bg-slate-50/50 flex justify-center items-center">
	<div
		class="h-fit w-96 border-slate-100 shadow-xl rounded-xl p-4 flex flex-col gap-4 bg-white"
	>
		<h1 class="text-xl font-bold mb-4">Login</h1>
		<form method="POST" class="flex items-center justify-between gap-2">
			<input
				class="bg-black/5 px-4 py-2.5 w-full rounded-xl"
				type="password"
				name="password"
				placeholder="Enter password"
				autocomplete="current-password"
			/>

			<button
				class=" text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-2 dark:bg-gray-600 dark:hover:bg-gray-700 cursor-pointer focus:outline-none dark:focus:ring-gray-800 transition-all"
				>Enter</button
			>
		</form>
	</div>
</div>
