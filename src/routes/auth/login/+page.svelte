<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>登录</h1>

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
			<input type="password" name="password" required />
		</label>
	</div>

	<button type="submit">登录</button>
</form>

<p>
	还没有账号？<a href="/auth/register">注册</a>
</p>

<div>
	<p>或使用第三方登录:</p>
	<a href="/api/auth/oauth/google">Google 登录</a>
</div>
