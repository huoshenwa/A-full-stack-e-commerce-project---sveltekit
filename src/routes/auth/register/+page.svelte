<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();

	// Svelte 5 Runes 处理表单状态
	let password = $state('');
	let confirmPassword = $state('');

	// 派生状态：判断密码是否匹配
	let isMatch = $derived(password === confirmPassword);
	let showWarning = $derived(confirmPassword.length > 0 && !isMatch);
</script>

<div class="auth-page">
	<div class="auth-card">
		<header>
			<h1>创建新账户</h1>
			<p>开启您的极简科技探索之旅</p>
		</header>

		{#if form?.error}
			<div class="message error">{form.error}</div>
		{/if}

		<form method="POST" class="auth-form">
			<div class="field">
				<label for="displayName">显示名称</label>
				<input type="text" id="displayName" name="displayName" placeholder="您的称呼" />
			</div>

			<div class="field">
				<label for="email">邮箱地址</label>
				<input type="email" id="email" name="email" placeholder="name@example.com" required />
			</div>

			<div class="field">
				<label for="password">设置密码</label>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					placeholder="至少 8 位字符"
					required
					minlength="8"
				/>
			</div>

			<div class="field">
				<label for="confirm">确认密码</label>
				<input
					type="password"
					id="confirm"
					bind:value={confirmPassword}
					class:input-error={showWarning}
					placeholder="再次输入密码"
					required
				/>
				{#if showWarning}
					<span class="hint">密码不一致</span>
				{/if}
			</div>

			<button type="submit" class="btn-primary" disabled={!isMatch && confirmPassword !== ''}>
				注册账户
			</button>
		</form>

		<footer>
			已有账号？ <a href="/auth/login">返回登录</a>
		</footer>
	</div>
</div>

<style>
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
		max-width: 420px;
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
		margin: 0 0 8px 0;
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
		position: relative;
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
		font-size: 1rem;
	}
	input:focus {
		outline: none;
		border-color: var(--primary);
		background: #fff;
	}
	input.input-error {
		border-color: #ff4444;
	}

	.hint {
		color: #ff4444;
		font-size: 0.75rem;
		position: absolute;
		bottom: -18px;
		right: 0;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		padding: 14px;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 10px;
		transition: opacity 0.2s;
	}
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
	footer a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
</style>
