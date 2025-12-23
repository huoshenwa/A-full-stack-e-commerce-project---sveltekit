<!-- src/routes/seller/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let products = $derived(data.products);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

<h1>我的商品</h1>

<a href="/products/create">创建新商品</a>

<form method="GET">
	<select name="status">
		<option value="">所有状态</option>
		<option value="draft" selected={filters.status === 'draft'}>草稿</option>
		<option value="active" selected={filters.status === 'active'}>已发布</option>
		<option value="archived" selected={filters.status === 'archived'}>已归档</option>
	</select>
	<button type="submit">筛选</button>
</form>

<table>
	<thead>
		<tr>
			<th>商品名称</th>
			<th>价格</th>
			<th>库存</th>
			<th>状态</th>
			<th>销量</th>
			<th>操作</th>
		</tr>
	</thead>
	<tbody>
		{#each products as product (product.id)}
			<tr>
				<td>
					<a href="/products/{product.slug}">{product.name}</a>
				</td>
				<td>¥{product.price}</td>
				<td>{product.stock}</td>
				<td>{product.isPublished ? '已发布' : '草稿'}</td>
				<td>{product.salesCount}</td>
				<td>
					<a href="/seller/products/{product.id}/edit">编辑</a>

					{#if product.isPublished}
						<form
							method="POST"
							action="/api/products/{product.id}/unpublish"
							style="display:inline;"
						>
							<button type="submit">下架</button>
						</form>
					{:else}
						<form method="POST" action="/api/products/{product.id}/publish" style="display:inline;">
							<button type="submit">发布</button>
						</form>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<div>
	{#if pagination.page > 1}
		<a href="?page={pagination.page - 1}&status={filters.status}">上一页</a>
	{/if}
	<span>第 {pagination.page} 页</span>
	<a href="?page={pagination.page + 1}&status={filters.status}">下一页</a>
</div>
