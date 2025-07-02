<script lang="ts">
	export let data: { incorrect?: boolean };
</script>

<form method="POST">
	<label>
		Password
		<input type="password" name="password" autocomplete="current-password" />
	</label>
	<button>Enter</button>
	{#if data.incorrect}
		<p style="color:red">Wrong password</p>
	{/if}
</form>
