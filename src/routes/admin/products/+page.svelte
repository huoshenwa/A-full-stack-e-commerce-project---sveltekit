<!-- src/routes/admin/products/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let products = $derived(data.products);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

<h1>商品管理（管理员）</h1>

<form method="GET">
	<input type="text" name="search" value={filters.search} placeholder="搜索商品" />

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
			<th>ID</th>
			<th>商品名称</th>
			<th>商家</th>
			<th>价格</th>
			<th>库存</th>
			<th>状态</th>
			<th>销量</th>
			<th>创建时间</th>
		</tr>
	</thead>
	<tbody>
		{#each products as product (product.id)}
			<tr>
				<td>{product.id.slice(0, 8)}</td>
				<td>
					<a href="/products/{product.slug}">{product.name}</a>
				</td>
				<td>{product.sellerName || '未知'}</td>
				<td>¥{product.price}</td>
				<td>{product.stock}</td>
				<td>{product.isPublished ? '已发布' : '草稿'}</td>
				<td>{product.salesCount}</td>
				<td>{new Date(product.createdAt).toLocaleDateString()}</td>
			</tr>
		{/each}
	</tbody>
</table>

<div>
	{#if pagination.page > 1}
		<a href="?page={pagination.page - 1}&status={filters.status}&search={filters.search}">
			上一页
		</a>
	{/if}
	<span>第 {pagination.page} 页</span>
	<a href="?page={pagination.page + 1}&status={filters.status}&search={filters.search}"> 下一页 </a>
</div>
