<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="auth-page">
	<div class="auth-card">
		<header>
			<h1>欢迎回来</h1>
			<p>请输入凭据以继续访问</p>
		</header>

		{#if form?.error}
			<div class="message error">{form.error}</div>
		{/if}

		<form method="POST" class="auth-form">
			<div class="field">
				<label for="email">邮箱地址</label>
				<input type="email" id="email" name="email" placeholder="name@example.com" required />
			</div>

			<div class="field">
				<div class="label-row">
					<label for="password">密码</label>
					<a href="/auth/forgot" class="text-link">忘记密码？</a>
				</div>
				<input type="password" id="password" name="password" placeholder="••••••••" required />
			</div>

			<button type="submit" class="btn-primary">登录</button>
		</form>

		<div class="divider"><span>或通过以下方式</span></div>

		<a href="/api/auth/oauth/google" class="btn-google">
			<img src="https://www.google.com/favicon.ico" alt="" width="16" />
			Google 账号登录
		</a>

		<footer>
			还没有账号？ <a href="/auth/register">立即注册</a>
		</footer>
	</div>
</div>

<style>
	/* 此处大部分样式与 Register 页面相同，为保持极简直接复用逻辑 */
	.auth-page {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
	}
	.auth-card {
		background: white;
		padding: 40px;
		border-radius: var(--border-radius);
		width: 100%;
		max-width: 400px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.02);
	}
	header {
		text-align: center;
		margin-bottom: 32px;
	}
	header h1 {
		font-size: 1.8rem;
		letter-spacing: -1px;
		margin-bottom: 8px;
	}
	header p {
		color: #888;
		font-size: 0.95rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #444;
	}

	input {
		padding: 12px 16px;
		border: 1px solid #eee;
		border-radius: 8px;
		background: #fcfcfc;
		transition: var(--transition);
	}
	input:focus {
		outline: none;
		border-color: var(--primary);
		background: #fff;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		padding: 14px;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.divider {
		margin: 25px 0;
		text-align: center;
		position: relative;
	}
	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #eee;
	}
	.divider span {
		background: #fff;
		padding: 0 10px;
		color: #999;
		font-size: 0.8rem;
		position: relative;
	}

	.btn-google {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 12px;
		border: 1px solid #eee;
		border-radius: 8px;
		text-decoration: none;
		color: #444;
		font-size: 0.9rem;
		transition: background 0.2s;
	}
	.btn-google:hover {
		background: #f9f9f9;
	}

	.message.error {
		background: #fff0f0;
		color: #d63031;
		padding: 12px;
		border-radius: 8px;
		font-size: 0.85rem;
		margin-bottom: 20px;
		border: 1px solid #ffdbdb;
	}
	footer {
		margin-top: 30px;
		text-align: center;
		font-size: 0.9rem;
		color: #666;
	}
	.text-link {
		font-size: 0.8rem;
		color: var(--accent);
		text-decoration: none;
	}
	footer a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
</style>
