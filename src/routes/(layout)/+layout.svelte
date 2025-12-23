<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css'; // 假设你在这里放置基础样式

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
</script>

<nav class="nav-container">
	<div class="nav-content">
		<div class="brand">
			<a href="/index" class="logo">ELECTRO<span>.</span></a>
		</div>

		<div class="links">
			<a href="/products">所有商品</a>
			{#if user?.permissions.includes('product.write')}
				<a href="/seller">商家中心</a>
			{/if}
			{#if user?.permissions.includes('product.manage')}
				<a href="/admin/products">管理中心</a>
			{/if}
		</div>

		<div class="auth">
			{#if user}
				<span class="welcome">你好, {user.displayName || user.email}</span>
				<form method="POST" action="/auth/logout" style="display: inline;">
					<button type="submit" class="btn-text">登出</button>
				</form>
			{:else}
				<a href="/auth/login">登录</a>
				<a href="/auth/register" class="btn-primary">开启探索</a>
			{/if}
		</div>
	</div>
</nav>

<main class="container">
	{@render children()}
</main>

<style>
	:global(body) {
		font-family:
			'Inter',
			-apple-system,
			sans-serif;
		background: #fafafa;
		color: #1a1a1a;
		margin: 0;
	}
	.nav-container {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid #eaeaea;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -1px;
		text-decoration: none;
		color: #000;
	}
	.logo span {
		color: #0070f3;
	}
	.links a {
		margin-right: 1.5rem;
		text-decoration: none;
		color: #666;
		font-size: 0.9rem;
		transition: color 0.2s;
	}
	.links a:hover {
		color: #000;
	}
	.btn-primary {
		background: #000;
		color: #fff !important;
		padding: 0.5rem 1.2rem;
		border-radius: 5px;
		text-decoration: none;
	}
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
