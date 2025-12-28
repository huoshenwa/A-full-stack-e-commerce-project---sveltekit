<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	// 使用 $derived 响应式获取数据
	let products = $derived(data.products);
	let categories = $derived(data.categories);
	let pagination = $derived(data.pagination);
	let filters = $derived(data.filters);
</script>

{#snippet productCard(product: any)}
	<article class="card">
		<a href="/products/{product.slug}" class="card-link">
			<div class="image-frame">
				{#if product.images[0]}
					<img src={product.images[0]} alt={product.name} loading="lazy" />
				{:else}
					<div class="placeholder-icon">PROD</div>
				{/if}
			</div>
			<div class="card-content">
				<div class="card-header">
					<span class="category-tag">Digital</span>
					{#if product.compareAtPrice}
						<span class="sale-badge">SALE</span>
					{/if}
				</div>
				<h3>{product.name}</h3>
				<p class="desc">{product.shortDescription || '暂无描述'}</p>
				<div class="card-footer">
					<div class="price-group">
						<span class="price">¥{product.price}</span>
						{#if product.compareAtPrice}
							<span class="old-price">¥{product.compareAtPrice}</span>
						{/if}
					</div>
				</div>
			</div>
		</a>
	</article>
{/snippet}
<section class="hero">
	<h1>探索极简科技<span class="dot">.</span></h1>
	<p>精选电子产品，回归质感生活。</p>
</section>
<section class="filter-wrapper">
	<form method="GET" class="search-form">
		<div class="input-group">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="search-icon"
				><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"
				></line></svg
			>
			<input
				type="text"
				name="search"
				value={filters.search}
				placeholder="搜索设备..."
				autocomplete="off"
			/>
		</div>
		<div class="select-group">
			<select name="categoryId">
				<option value="">全部分类</option>
				{#each categories as category}
					<option
						class="text-black"
						value={category.id}
						selected={category.id === filters.categoryId}
					>
						{category.name}
					</option>
				{/each}
			</select>
			<svg
				class="chevron"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg
			>
		</div>
		<button type="submit"> 筛选 </button>
	</form>
</section>
<div class="product-grid">
	{#each products as product (product.id)}
		{@render productCard(product)}
	{:else}
		<div class="empty-state">
			<p>暂无相关商品</p>
			<a href="/products" class="reset-link">重置筛选</a>
		</div>
	{/each}
</div>
<footer class="pagination">
	{#if pagination.page > 1}
		<a
			class="page-btn prev"
			href="?page={pagination.page - 1}&search={filters.search}&categoryId={filters.categoryId}"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
			>
		</a>
	{/if}
	<span class="page-info">{pagination.page}</span>
	{#if products.length >= 20}
		<a class="page-btn next" href="?page={pagination.page + 1}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
			>
		</a>
	{:else}
		<span class="page-btn disabled">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
			>
		</span>
	{/if}
</footer>

<style>
	@import 'tailwindcss';
	/* Hero Section */
	.hero {
		@apply py-24 text-center;
	}
	.hero h1 {
		@apply mb-4 text-5xl font-extrabold tracking-tight text-white md:text-7xl;
	}
	.hero .dot {
		@apply text-blue-500;
	}
	.hero p {
		@apply mx-auto max-w-lg text-lg font-light text-neutral-400;
	}
	/* Filter Bar - 胶囊风格 */
	.filter-wrapper {
		@apply mb-16 flex justify-center;
	}
	.search-form {
		@apply flex w-full max-w-2xl items-center gap-0 rounded-full border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl shadow-black/50;
	}
	/* 输入框重置 */
	.input-group {
		@apply flex flex-1 items-center pl-5 text-neutral-500;
	}
	.input-group input {
		@apply w-full border-none bg-transparent p-4 text-white outline-none placeholder:text-neutral-600;
	}
	/* 下拉框重置 */
	.select-group {
		@apply relative flex items-center border-l border-neutral-800 px-4;
	}
	.select-group select {
		@apply cursor-pointer appearance-none border-none bg-transparent pr-6 text-sm text-white outline-none;
	}
	.select-group .chevron {
		@apply pointer-events-none absolute right-3 text-neutral-500;
	}
	/* 按钮样式 */
	.search-form button {
		@apply h-12 cursor-pointer rounded-full border-none bg-white px-8 font-semibold text-black transition-all hover:bg-neutral-200;
	}
	/* Grid Layout */
	.product-grid {
		@apply grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4;
	}
	/* Card Styling - 深色卡片 */
	.card {
		@apply relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700;
	}
	.card-link {
		@apply flex h-full flex-col text-inherit no-underline;
	}
	/* Image Area */
	.image-frame {
		@apply relative flex aspect-square items-center justify-center overflow-hidden border-b border-neutral-800 bg-neutral-950;
	}
	/* 修复：移除 group-hover，改用标准 CSS 选择器实现悬停放大 */
	.image-frame img {
		@apply h-full w-full object-cover transition-transform duration-500;
	}
	.card:hover .image-frame img {
		transform: scale(1.05);
	}
	.placeholder-icon {
		@apply text-3xl font-bold tracking-widest text-neutral-800;
	}
	/* Card Content */
	.card-content {
		@apply flex flex-grow flex-col p-5;
	}
	.card-header {
		@apply mb-3 flex items-center justify-between;
	}
	.category-tag {
		@apply text-xs font-bold tracking-widest text-neutral-500 uppercase;
	}
	.sale-badge {
		@apply rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white;
	}
	.card h3 {
		@apply my-2 line-clamp-2 text-base leading-snug font-medium text-neutral-100;
	}
	.desc {
		@apply mb-4 line-clamp-2 text-sm leading-relaxed text-neutral-500;
	}
	.card-footer {
		@apply mt-auto;
	}
	.price-group {
		@apply flex items-baseline gap-2;
	}
	.price {
		@apply text-lg font-bold text-neutral-100;
	}
	.old-price {
		@apply text-sm text-neutral-600 line-through;
	}
	/* Empty State */
	.empty-state {
		@apply col-span-full py-16 text-center text-neutral-600;
	}
	.reset-link {
		@apply mt-4 inline-block text-blue-500 no-underline hover:text-blue-400;
	}
	/* Pagination */
	.pagination {
		@apply mt-20 flex items-center justify-center gap-6;
	}
	.page-info {
		@apply font-mono text-neutral-600;
	}
	.page-btn {
		@apply flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed;
	}
	.disabled {
		@apply border-neutral-900 text-neutral-800;
	}
	/* 移动端适配 */
	@media (max-width: 640px) {
		.search-form {
			@apply flex-col gap-3 rounded-2xl p-3;
		}
		.input-group,
		.select-group {
			@apply w-full rounded-xl border-none bg-neutral-950 px-4;
		}
		.select-group {
			@apply h-12;
		}
		.search-form button {
			@apply w-full rounded-xl;
		}
	}
</style>
