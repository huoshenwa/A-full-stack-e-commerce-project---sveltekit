<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	let { data }: { data: PageData } = $props();
	let products = $derived(data.products);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

<div class="seller-container">
	<header class="page-header">
		<div class="header-main">
			<h1>我的商品</h1>
			<p class="subtitle">管理您的商品库存、状态及销售情况</p>
		</div>
		<a href="/products/create" class="btn-primary">+ 创建新商品</a>
	</header>
	<div class="toolbar">
		<form method="GET" class="filter-form">
			<div class="select-wrapper">
				<select name="status">
					<option value="">所有状态</option>
					<option value="draft" selected={filters.status === 'draft'}>草稿箱</option>
					<option value="active" selected={filters.status === 'active'}>已发布</option>
					<option value="archived" selected={filters.status === 'archived'}>已归档</option>
				</select>
			</div>
			<button type="submit" class="btn-secondary">筛选</button>
		</form>
	</div>
	<div class="data-panel">
		<table class="modern-table">
			<thead>
				<tr>
					<th>商品详情</th>
					<th>单价</th>
					<th>库存</th>
					<th>当前状态</th>
					<th>累计销量</th>
					<th class="text-right">管理操作</th>
				</tr>
			</thead>
			<tbody>
				{#each products as product (product.id)}
					<tr>
						<td>
							<div class="product-info">
								<a href="/products/{product.slug}" class="product-name">{product.name}</a>
								<span class="product-id">ID: {product.id.slice(0, 8)}</span>
							</div>
						</td>
						<td class="font-medium">¥{product.price}</td>
						<td>
							<span class="stock-text" class:low-stock={product.stock < 10}>
								{product.stock}
							</span>
						</td>
						<td>
							<span class="status-badge" class:active={product.isPublished}>
								{product.isPublished ? '销售中' : '仓库中'}
							</span>
						</td>
						<td>{product.salesCount}</td>
						<td class="text-right">
							<div class="actions-group">
								<a href="/seller/products/{product.id}/edit" class="action-link">编辑</a>
								{#if product.isPublished}
									<form method="POST" action="/api/products/{product.id}/unpublish" use:enhance>
										<button type="submit" class="action-btn danger">下架</button>
									</form>
								{:else}
									<form method="POST" action="/api/products/{product.id}/publish" use:enhance>
										<button type="submit" class="action-btn success">上架</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<nav class="pagination">
		{#if pagination.page > 1}
			<a href="?page={pagination.page - 1}&status={filters.status}" class="page-btn">上一页</a>
		{/if}
		<span class="page-indicator">第 {pagination.page} 页</span>
		<a href="?page={pagination.page + 1}&status={filters.status}" class="page-btn">下一页</a>
	</nav>
</div>

<style>
	@reference '../layout.css';
	/* 
		 * 布局容器
		 */
	.seller-container {
		@apply mx-auto max-w-[1100px] p-4 text-slate-200 md:p-6 lg:p-8;
	}
	/* 
		 * 头部区域 
		 */
	.page-header {
		@apply mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end;
	}
	.header-main h1 {
		@apply text-2xl font-bold tracking-tight text-slate-100 md:text-3xl;
	}
	.subtitle {
		@apply mt-1 text-sm text-slate-400;
	}
	/* 
		 * 按钮组件
		 */
	.btn-primary {
		@apply inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95;
	}
	.btn-secondary {
		@apply rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-slate-500 focus:outline-none;
	}
	/* 
		 * 工具栏与筛选
		 */
	.toolbar {
		@apply mb-6 flex items-center gap-4;
	}
	.filter-form {
		@apply flex w-full max-w-xs gap-3;
	}
	.select-wrapper {
		@apply relative w-full;
	}
	select {
		@apply w-full appearance-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 pr-10 text-sm text-slate-200 shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none;
	}
	/* 
		 * 数据面板与表格
		 */
	.data-panel {
		@apply overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-sm;
	}
	.modern-table {
		@apply w-full text-left text-sm;
	}
	.modern-table th {
		@apply px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase;
	}
	.modern-table td {
		@apply border-t border-slate-800/50 px-6 py-4 align-middle;
	}
	.modern-table tr:hover td {
		@apply bg-slate-800/30;
	}
	/* 
		 * 表格内容元素
		 */
	.product-info {
		@apply flex flex-col gap-1;
	}
	.product-name {
		@apply font-medium text-slate-100 transition-colors hover:text-blue-400;
	}
	.product-id {
		@apply font-mono text-xs text-slate-600;
	}
	.stock-text {
		@apply text-slate-300;
	}
	.stock-text.low-stock {
		@apply font-semibold text-red-400;
	}
	/* 状态徽章 */
	.status-badge {
		@apply inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-400 transition-colors;
	}
	.status-badge.active {
		@apply border-emerald-500/30 bg-emerald-500/10 text-emerald-400;
	}
	.status-badge::before {
		content: '';
		@apply h-1.5 w-1.5 rounded-full bg-current;
	}
	/* 
		 * 操作区
		 */
	.actions-group {
		@apply flex justify-end gap-4;
	}
	.action-link {
		@apply text-sm font-medium text-slate-400 transition-colors hover:text-white;
	}
	.action-btn {
		@apply cursor-pointer bg-transparent p-0 text-sm font-medium transition-colors outline-none;
	}
	.action-btn.success {
		@apply text-emerald-400 hover:text-emerald-300;
	}
	.action-btn.danger {
		@apply text-red-400 hover:text-red-300;
	}
	/* 
		 * 分页
		 */
	.pagination {
		@apply mt-8 flex items-center justify-center gap-8;
	}
	.page-btn {
		@apply rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50;
	}
	.page-indicator {
		@apply text-sm font-medium text-slate-500;
	}
	/* 
		 * 辅助类
		 */
	.text-right {
		@apply text-right;
	}
	.font-medium {
		@apply font-medium;
	}
</style>
