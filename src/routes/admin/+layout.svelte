<script lang="ts">
	// ... 原有的逻辑
	import { page } from '$app/state'; // Svelte 5 访问 URL
	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
	let isAdminPage = $derived(page.url.pathname.startsWith('/admin'));
</script>

<div class="app-wrapper">
	<nav class="nav-container"></nav>

	<div class="main-layout" class:admin-layout={isAdminPage}>
		{#if isAdminPage}
			<aside class="sidebar">
				<div class="sidebar-group">
					<p class="group-label">控制面板</p>
					<a href="/admin/products" class:active={page.url.pathname === '/admin/products'}
						>商品管理</a
					>
					<a href="/admin/categories" class:active={page.url.pathname === '/admin/categories'}
						>分类管理</a
					>
				</div>
				<div class="sidebar-group">
					<p class="group-label">系统</p>
					<a href="/admin/users">用户列表</a>
					<a href="/admin/settings">站点设置</a>
				</div>
			</aside>
		{/if}

		<main class="content-area">
			{@render children()}
		</main>
	</div>
</div>

<style>
	/* 在原有样式基础上增加 */
	.admin-layout {
		display: grid;
		grid-template-columns: 240px 1fr;
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}
	.sidebar {
		padding: 40px 20px;
		border-right: 1px solid #eee;
		min-height: calc(100vh - 70px);
	}
	.group-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #999;
		font-weight: 700;
		margin-bottom: 15px;
		letter-spacing: 1px;
	}
	.sidebar-group {
		margin-bottom: 30px;
	}
	.sidebar-group a {
		display: block;
		padding: 10px 15px;
		color: #444;
		text-decoration: none;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: all 0.2s;
		margin-bottom: 4px;
	}
	.sidebar-group a:hover {
		background: #f0f0f0;
	}
	.sidebar-group a.active {
		background: #000;
		color: #fff;
	}

	.content-area {
		padding: 40px;
	}
</style>
