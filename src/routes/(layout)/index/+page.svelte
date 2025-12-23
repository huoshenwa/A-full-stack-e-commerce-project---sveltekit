<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// 使用 $derived 响应式获取数据
	let products = $derived(data.products);
	let categories = $derived(data.categories);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

{#snippet productCard(product)}
	<article class="card">
		<a href="/products/{product.slug}" class="card-link">
			<div class="image-placeholder">
				{product.name[0]}
			</div>
			<div class="card-content">
				<span class="category-tag">Digital</span>
				<h3>{product.name}</h3>
				<p class="desc">{product.shortDescription || '暂无描述'}</p>
				<div class="card-footer">
					<span class="price">¥{product.price}</span>
					{#if product.compareAtPrice}
						<span class="old-price">¥{product.compareAtPrice}</span>
					{/if}
				</div>
			</div>
		</a>
	</article>
{/snippet}

<section class="hero">
	<h1>探索极简科技<span>.</span></h1>
	<p>精选电子产品，回归质感生活。</p>
</section>

<section class="filter-bar">
	<form method="GET" class="search-form">
		<input type="text" name="search" value={filters.search} placeholder="搜索你感兴趣的设备..." />
		<select name="categoryId">
			<option value="">所有分类</option>
			{#each categories as category}
				<option value={category.id} selected={category.id === filters.categoryId}>
					{category.name}
				</option>
			{/each}
		</select>
		<button type="submit">筛选</button>
	</form>
</section>

<div class="product-grid">
	{#each products as product (product.id)}
		{@render productCard(product)}
	{:else}
		<p class="empty">暂无相关商品</p>
	{/each}
</div>

<footer class="pagination">
	{#if pagination.page > 1}
		<a
			class="page-btn"
			href="?page={pagination.page - 1}&search={filters.search}&categoryId={filters.categoryId}"
		>
			上一页
		</a>
	{/if}

	<span class="page-info">Page {pagination.page}</span>

	<a
		class="page-btn"
		href="?page={pagination.page + 1}&search={filters.search}&categoryId={filters.categoryId}"
	>
		下一页
	</a>
</footer>

<style>
	.hero {
		padding: 4rem 0;
		text-align: center;
	}
	.hero h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		letter-spacing: -2px;
	}
	.hero p {
		color: #888;
		font-size: 1.1rem;
	}

	.filter-bar {
		margin-bottom: 3rem;
		display: flex;
		justify-content: center;
	}
	.search-form {
		display: flex;
		gap: 10px;
		background: #fff;
		padding: 8px;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}
	.search-form input,
	.search-form select {
		border: none;
		padding: 0.8rem;
		outline: none;
		background: transparent;
	}
	.search-form button {
		background: #000;
		color: #fff;
		border: none;
		padding: 0 1.5rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 2.5rem;
	}

	.card {
		background: transparent;
		transition: transform 0.3s ease;
	}
	.card:hover {
		transform: translateY(-5px);
	}
	.card-link {
		text-decoration: none;
		color: inherit;
	}

	.image-placeholder {
		aspect-ratio: 1/1;
		background: #efefef;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 4rem;
		font-weight: bold;
		color: #ddd;
		margin-bottom: 1rem;
	}

	.category-tag {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: #0070f3;
		font-weight: 700;
		letter-spacing: 1px;
	}
	.card h3 {
		margin: 0.5rem 0;
		font-size: 1.2rem;
	}
	.desc {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.price {
		font-weight: 700;
		font-size: 1.1rem;
	}
	.old-price {
		text-decoration: line-through;
		color: #aaa;
		font-size: 0.9rem;
		margin-left: 8px;
	}

	.pagination {
		margin-top: 4rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}
	.page-btn {
		padding: 0.6rem 1.5rem;
		border: 1px solid #eaeaea;
		border-radius: 20px;
		text-decoration: none;
		color: #000;
		font-size: 0.9rem;
		transition: background 0.2s;
	}
	.page-btn:hover {
		background: #000;
		color: #fff;
	}
</style>
