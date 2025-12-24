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
							<span class="status-dot" class:active={product.isPublished}>
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
	.seller-container {
		max-width: 1100px;
		margin: 40px auto;
		padding: 0 20px;
		color: #111;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 32px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 600;
		margin: 0 0 4px 0;
	}

	.subtitle {
		color: #666;
		font-size: 14px;
		margin: 0;
	}

	/* 工具栏 */
	.toolbar {
		margin-bottom: 20px;
	}

	.filter-form {
		display: flex;
		gap: 12px;
	}

	select {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: #fff;
		font-size: 14px;
		outline: none;
	}

	/* 数据表格 */
	.data-panel {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 12px;
		overflow: hidden;
	}

	.modern-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.modern-table th {
		text-align: left;
		padding: 16px;
		background: #fafafa;
		color: #888;
		font-weight: 500;
		border-bottom: 1px solid #eee;
	}

	.modern-table td {
		padding: 16px;
		border-bottom: 1px solid #f5f5f5;
	}

	.product-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.product-name {
		color: #111;
		text-decoration: none;
		font-weight: 500;
	}

	.product-name:hover {
		color: #0070f3;
	}

	.product-id {
		font-size: 12px;
		color: #aaa;
		font-family: monospace;
	}

	/* 状态点样式 */
	.status-dot {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #666;
	}

	.status-dot::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ccc;
	}

	.status-dot.active {
		color: #2e7d32;
	}

	.status-dot.active::before {
		background: #4caf50;
	}

	.low-stock {
		color: #d32f2f;
		font-weight: 600;
	}

	/* 操作按钮 */
	.actions-group {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 16px;
	}

	.action-link {
		color: #666;
		text-decoration: none;
	}

	.action-link:hover {
		color: #000;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}

	.action-btn.success {
		color: #0070f3;
	}
	.action-btn.danger {
		color: #ff4d4f;
	}

	/* 通用按钮样式 */
	.btn-primary {
		background: #111;
		color: #fff;
		padding: 10px 20px;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		font-size: 14px;
	}

	.btn-secondary {
		background: #fff;
		border: 1px solid #ddd;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
	}

	/* 分页 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 32px;
		margin-top: 32px;
	}

	.page-btn {
		color: #666;
		text-decoration: none;
		font-size: 14px;
	}

	.page-indicator {
		font-size: 14px;
		color: #aaa;
	}

	.text-right {
		text-align: right;
	}
	.font-medium {
		font-weight: 500;
	}
</style>
