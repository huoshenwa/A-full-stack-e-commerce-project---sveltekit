<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let products = $derived(data.products);
	let categories = $derived(data.categories);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

<!-- src/routes/+page.svelte -->
<h1>商品列表</h1>

<form method="GET">
	<input type="text" name="search" value={filters.search} placeholder="搜索商品" />

	<select name="categoryId">
		<option value="">所有分类</option>
		{#each categories as category}
			<option value={category.id} selected={category.id === filters.categoryId}>
				{category.name}
			</option>
		{/each}
	</select>

	<button type="submit">搜索</button>
</form>

<div>
	{#each products as product (product.id)}
		<article>
			<a href="/products/{product.slug}">
				<h3>{product.name}</h3>
			</a>
			<p>{product.shortDescription || ''}</p>
			<p>价格: ¥{product.price}</p>
			<p>库存: {product.stock}</p>
			{#if product.compareAtPrice}
				<p>原价: ¥{product.compareAtPrice}</p>
			{/if}
			<p>评分: {product.rating} ({product.reviewCount}条评论)</p>
			<p>销量: {product.salesCount}</p>
		</article>
	{/each}
</div>

<div>
	{#if pagination.page > 1}
		<a href="?page={pagination.page - 1}&search={filters.search}&categoryId={filters.categoryId}">
			上一页
		</a>
	{/if}

	<span>第 {pagination.page} 页</span>

	<a href="?page={pagination.page + 1}&search={filters.search}&categoryId={filters.categoryId}">
		下一页
	</a>
</div>
