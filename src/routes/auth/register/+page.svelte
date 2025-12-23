<!-- src/routes/auth/register/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>注册</h1>

{#if form?.error}
	<p>{form.error}</p>
{/if}

<form method="POST">
	<div>
		<label>
			邮箱:
			<input type="email" name="email" required />
		</label>
	</div>

	<div>
		<label>
			密码:
			<input type="password" name="password" required minlength="8" />
		</label>
	</div>

	<div>
		<label>
			显示名称:
			<input type="text" name="displayName" />
		</label>
	</div>

	<button type="submit">注册</button>
</form>

<p>
	已有账号？<a href="/auth/login">登录</a>
</p>
