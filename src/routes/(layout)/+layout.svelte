<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let user = $derived(data.user);
</script>

<nav>
	<a href="/">首页</a>
	<a href="/products">商品</a>

	{#if user}
		<span>欢迎，{user.displayName || user.email}</span>

		{#if user.permissions.includes('product.write')}
			<a href="/seller">商家中心</a>
			<a href="/products/create">发布商品</a>
		{/if}

		{#if user.permissions.includes('product.manage')}
			<a href="/admin/categories">分类管理</a>
			<a href="/admin/products">商品管理</a>
		{/if}

		<form method="POST" action="/auth/logout">
			<button type="submit">登出</button>
		</form>
	{:else}
		<a href="/auth/login">登录</a>
		<a href="/auth/register">注册</a>
	{/if}
</nav>

<main>
	{@render children()}
</main>
