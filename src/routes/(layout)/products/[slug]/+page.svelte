<!-- src/routes/products/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let product = $derived(data.product);
</script>

<h1>{product.name}</h1>

<div>
	{#if product.images && product.images.length > 0}
		{#each product.images as image}
			<img src={image} alt={product.name} />
		{/each}
	{/if}
</div>

<div>
	<p>价格: ¥{product.price}</p>
	{#if product.compareAtPrice}
		<p>原价: ¥{product.compareAtPrice}</p>
	{/if}
	<p>库存: {product.stock}</p>
	<p>SKU: {product.sku || '无'}</p>
</div>

<div>
	<p>{product.shortDescription || ''}</p>
	<div>{@html product.description || ''}</div>
</div>

{#if product.attributes}
	<div>
		<h3>商品属性</h3>
		<pre>{JSON.stringify(product.attributes, null, 2)}</pre>
	</div>
{/if}

{#if product.variants && product.variants.length > 0}
	<div>
		<h3>商品规格</h3>
		{#each product.variants as variant (variant.id)}
			<div>
				<p>{variant.name}</p>
				<p>价格: ¥{variant.price}</p>
				<p>库存: {variant.stock}</p>
				<p>SKU: {variant.sku}</p>
			</div>
		{/each}
	</div>
{/if}

<div>
	<p>评分: {product.rating} / 5.0</p>
	<p>评论数: {product.reviewCount}</p>
	<p>销量: {product.salesCount}</p>
	<p>浏览: {product.viewCount}</p>
</div>

<div>
	<p>商家: {product.sellerName || '未知'}</p>
	{#if product.categoryName}
		<p>分类: {product.categoryName}</p>
	{/if}
</div>
