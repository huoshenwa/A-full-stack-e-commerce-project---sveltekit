<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let products = $derived(data.products);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

<div class="admin-wrapper">
	<header class="page-header flex-between">
		<h1>商品库存管理</h1>
		<a href="/products/create" class="btn-main">发布商品</a>
	</header>

	<section class="filter-bar">
		<form method="GET" class="filter-form">
			<input type="text" name="search" value={filters.search} placeholder="搜索名称或商家" />
			<select name="status">
				<option value="">所有状态</option>
				<option value="draft" selected={filters.status === 'draft'}>草稿</option>
				<option value="active" selected={filters.status === 'active'}>已发布</option>
			</select>
			<button type="submit" class="btn-sub">筛选数据</button>
		</form>
	</section>

	<section class="panel no-padding">
		<table class="simple-table">
			<thead>
				<tr>
					<th>商品名称</th>
					<th>商家</th>
					<th>价格</th>
					<th>库存</th>
					<th>状态</th>
					<th>销量</th>
					<th>更新日期</th>
				</tr>
			</thead>
			<tbody>
				{#each products as product (product.id)}
					<tr>
						<td>
							<a href="/products/{product.slug}" class="product-link">{product.name}</a>
							<div class="id-tag">{product.id.slice(0, 8)}</div>
						</td>
						<td>{product.sellerName || '-'}</td>
						<td class="price-cell">¥{product.price}</td>
						<td class:low-stock={product.stock < 10}>{product.stock}</td>
						<td>
							<span class="badge" class:active={product.isPublished}>
								{product.isPublished ? '已发布' : '草稿'}
							</span>
						</td>
						<td>{product.salesCount}</td>
						<td class="date-cell">{new Date(product.createdAt).toLocaleDateString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<nav class="pagination">
		{#if pagination.page > 1}
			<a href="?page={pagination.page - 1}&search={filters.search}&status={filters.status}"
				>← 上一页</a
			>
		{/if}
		<span class="page-num">第 {pagination.page} / {pagination.totalPages || 1} 页</span>
		<a href="?page={pagination.page + 1}&search={filters.search}&status={filters.status}"
			>下一页 →</a
		>
	</nav>
</div>

<style>
	.admin-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		color: #1a1a1a;
	}
	.flex-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.page-header h1 {
		font-size: 22px;
		font-weight: 600;
	}

	/* 过滤器 */
	.filter-bar {
		margin-bottom: 20px;
	}
	.filter-form {
		display: flex;
		gap: 12px;
	}
	.filter-form input {
		flex: 1;
		max-width: 300px;
	}
	.btn-sub {
		background: #fff;
		border: 1px solid #ddd;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
	}

	/* 数据展示 */
	.panel {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 8px;
		overflow: hidden;
	}
	.no-padding {
		padding: 0;
	}

	.product-link {
		text-decoration: none;
		color: #000;
		font-weight: 500;
		font-size: 15px;
	}
	.product-link:hover {
		color: #0070f3;
	}
	.id-tag {
		font-size: 11px;
		color: #aaa;
		margin-top: 2px;
	}

	.price-cell {
		font-weight: 600;
	}
	.low-stock {
		color: #e53e3e;
		font-weight: 600;
	}

	.badge {
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 4px;
		background: #f0f0f0;
		color: #666;
	}
	.badge.active {
		background: #e6f7ff;
		color: #1890ff;
	}

	.date-cell {
		color: #999;
		font-size: 13px;
	}

	/* 分页导航 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;
		margin-top: 30px;
	}
	.pagination a {
		color: #000;
		text-decoration: none;
		font-size: 14px;
		border-bottom: 1px solid transparent;
	}
	.pagination a:hover {
		border-bottom-color: #000;
	}
	.page-num {
		font-size: 14px;
		color: #888;
	}
</style>
