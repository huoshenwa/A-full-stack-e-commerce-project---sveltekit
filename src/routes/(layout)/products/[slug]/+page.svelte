<!-- src/routes/products/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Minus, Plus, ShoppingCart, Loader2 } from '@lucide/svelte';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let product = $derived(data.product);
	// 状态管理：当前展示的主图索引
	let activeImageIndex = $state(0);
	// 状态管理：选中的规格
	let selectedVariantId = $state(product.variants?.[0]?.id || null);
	// 派生状态：当前选中的规格详情
	let selectedVariant = $derived(product.variants?.find((v) => v.id === selectedVariantId) || null);
	// 状态管理：购买数量
	let quantity = $state(1);
	// 当前最大库存限制
	let maxStock = $derived(selectedVariant?.stock ?? product.stock ?? 999);
	// 派生状态：当前选中的最终价格
	let currentPrice = $derived(selectedVariant?.price || product.price);
	// 购物车交互状态 (仅针对"加入购物车"按钮，"立即购买"由 form 处理)
	let isCartLoading = $state(false);
	/**
	 * 更新数量逻辑
	 */
	console.log(data);

	function updateQuantity(delta: number) {
		const newQty = quantity + delta;
		if (newQty >= 1 && newQty <= maxStock) {
			quantity = newQty;
		}
	}
	/**
	 * 加入购物车 (保持原有的前端 API 调用方式)
	 */
	async function addToCart() {
		if (isCartLoading) return;
		isCartLoading = true;
		try {
			const res = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					productId: product.id,
					variantId: selectedVariantId,
					quantity: quantity
				})
			});
			if (res.ok) {
				alert('已成功加入购物车');
			} else {
				alert('加入失败');
			}
		} catch (error) {
			console.error(error);
			alert('网络错误');
		} finally {
			isCartLoading = false;
		}
	}
</script>

<div class="product-page">
	<div class="product-container">
		<div class="product-hero">
			<div class="media-gallery">
				<div class="main-image">
					{#if product.images && product.images.length > 0}
						<img src={product.images[activeImageIndex]} alt={product.name} />
					{:else}
						<div class="placeholder">No Image</div>
					{/if}
				</div>
				{#if product.images && product.images.length > 1}
					<div class="thumbnail-list">
						{#each product.images as image, i}
							<button
								class="thumb-btn"
								class:active={activeImageIndex === i}
								onclick={() => (activeImageIndex = i)}
							>
								<img src={image} alt="" />
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div class="purchase-panel">
				<nav class="breadcrumb">
					<a href="/products">商品</a> / {product.categoryName || '电子产品'}
				</nav>
				<h1 class="title">{product.name}</h1>
				<div class="stats-row">
					<span class="rating">★ {product.rating}</span>
					<span class="divider">|</span>
					<span class="sales">销量 {product.salesCount}</span>
					<span class="divider">|</span>
					<span class="seller">商家：{product.sellerName}</span>
				</div>
				<p class="short-desc">{product.shortDescription || ''}</p>
				<div class="price-section">
					<span class="current-price">¥{currentPrice}</span>
					{#if product.compareAtPrice}
						<span class="old-price">¥{product.compareAtPrice}</span>
					{/if}
				</div>
				<hr class="divider-line" />
				{#if product.variants && product.variants.length > 0}
					<div class="variants-section">
						<h3>选择规格</h3>
						<div class="variant-grid">
							{#each product.variants as variant}
								<button
									class="variant-chip"
									class:selected={selectedVariantId === variant.id}
									onclick={() => {
										selectedVariantId = variant.id;
										quantity = 1; // 切换规格重置数量
									}}
								>
									{variant.name}
									<span class="v-price">¥{variant.price}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
				<!-- 数量选择器 -->
				<div class="quantity-section">
					<h3>购买数量</h3>
					<div class="quantity-control">
						<button class="qty-btn" onclick={() => updateQuantity(-1)} disabled={quantity <= 1}>
							<Minus class="w-4 h-4" />
						</button>
						<span class="qty-display">{quantity}</span>
						<button
							class="qty-btn"
							onclick={() => updateQuantity(1)}
							disabled={quantity >= maxStock}
						>
							<Plus class="w-4 h-4" />
						</button>
					</div>
					<span class="stock-hint">剩余库存: {maxStock} 件</span>
				</div>
				<div class="inventory-info">
					<span class="sku-text">SKU: {selectedVariant?.sku ?? product.sku ?? 'N/A'}</span>
				</div>
				<div class="action-buttons">
					<!-- 
							Svelte 5 Native Form Action 
							?action=?/buyNow 对应 server.ts 中的 actions.buyNow
							form 提交会自动处理 loading 状态和跳转
						-->
					<form method="POST" action="?/buyNow" class="buy-now-form">
						<!-- 传递必要的数据 -->
						<input type="hidden" name="productId" value={product.id} />
						<input type="hidden" name="variantId" value={selectedVariantId || ''} />
						<input type="hidden" name="quantity" value={quantity} />
						<button type="submit" class="btn-buy" disabled={!!form}>
							{#if form}
								<Loader2 class="animate-spin icon-sm" />
								正在处理...
							{:else}
								立即购买
							{/if}
						</button>
					</form>
					<!-- 加入购物车保持独立的前端交互 -->
					<button class="btn-cart" onclick={addToCart} disabled={isCartLoading}>
						{#if isCartLoading}
							<Loader2 class="animate-spin icon-sm" />
							处理中...
						{:else}
							<ShoppingCart class="icon-sm" />
							加入购物车
						{/if}
					</button>
				</div>
			</div>
		</div>
		<div class="product-details">
			<div class="tabs">
				<button class="tab-active">详细介绍</button>
				<button>规格参数</button>
				<button>评价 ({product.reviewCount})</button>
			</div>
			<div class="detail-content">
				<div class="rich-text">
					{@html product.description || '<p class="empty">暂无详细描述</p>'}
				</div>
				{#if product.attributes}
					<div class="attributes-table">
						<h3>参数规格</h3>
						<div class="table">
							{#each Object.entries(product.attributes) as [key, value]}
								<div class="row">
									<span class="label">{key}</span>
									<span class="value">{value}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@import 'tailwindcss';
	/* 保持之前的样式设计 */
	.product-page {
		@apply min-h-screen bg-neutral-950 font-sans text-neutral-200 antialiased;
	}
	.product-container {
		@apply mx-auto max-w-7xl p-6 lg:p-12;
	}
	.product-hero {
		@apply mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16;
	}
	.media-gallery {
		@apply sticky top-8 flex flex-col gap-6 self-start;
	}
	.main-image {
		@apply relative aspect-square overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl;
	}
	.main-image img {
		@apply h-full w-full object-cover transition-transform duration-700;
	}
	.main-image .placeholder {
		@apply flex h-full w-full items-center justify-center text-neutral-600;
	}
	.thumbnail-list {
		@apply flex gap-3 overflow-x-auto pb-2;
		scrollbar-width: thin;
		scrollbar-color: #262626 transparent;
	}
	.thumbnail-list::-webkit-scrollbar {
		height: 6px;
	}
	.thumbnail-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.thumbnail-list::-webkit-scrollbar-thumb {
		background-color: #262626;
		border-radius: 20px;
	}
	.thumb-btn {
		@apply h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 opacity-60 transition-all duration-300 focus:outline-none;
		@apply border-neutral-800 hover:border-neutral-500 hover:opacity-100;
	}
	.thumb-btn img {
		@apply h-full w-full object-cover;
	}
	.thumb-btn.active {
		@apply border-white opacity-100 ring-2 ring-neutral-800 ring-offset-2 ring-offset-neutral-950;
	}
	.purchase-panel {
		@apply flex flex-col gap-6;
	}
	.breadcrumb {
		@apply text-sm font-medium text-neutral-500;
	}
	.breadcrumb a {
		@apply transition-colors hover:text-white;
	}
	.title {
		@apply text-4xl leading-tight font-bold tracking-tight text-white lg:text-5xl;
	}
	.stats-row {
		@apply flex items-center gap-4 text-sm text-neutral-400;
	}
	.stats-row .divider {
		@apply text-neutral-700;
	}
	.short-desc {
		@apply text-lg leading-relaxed text-neutral-400;
	}
	.price-section {
		@apply flex items-end gap-4 py-2;
	}
	.current-price {
		@apply text-4xl font-bold text-white;
	}
	.old-price {
		@apply mb-1.5 text-xl text-neutral-600 line-through;
	}
	.divider-line {
		@apply border-neutral-800;
	}
	.variants-section {
		@apply flex flex-col gap-4;
	}
	.variants-section h3 {
		@apply text-sm font-medium tracking-wider text-neutral-400 uppercase;
	}
	.variant-grid {
		@apply flex flex-wrap gap-3;
	}
	.variant-chip {
		@apply flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-all duration-200 select-none hover:border-neutral-600 hover:text-white;
	}
	.variant-chip.selected {
		@apply border-white bg-neutral-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.15)];
	}
	.variant-chip .v-price {
		@apply text-xs opacity-60;
	}
	.quantity-section {
		@apply flex flex-col gap-3;
	}
	.quantity-section h3 {
		@apply text-sm font-medium tracking-wider text-neutral-400 uppercase;
	}
	.quantity-control {
		@apply flex w-fit items-center gap-4;
	}
	.qty-btn {
		@apply flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-300 transition-all hover:border-neutral-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30;
	}
	.qty-display {
		@apply w-12 text-center text-lg font-semibold text-white tabular-nums;
	}
	.stock-hint {
		@apply text-xs text-neutral-500;
	}
	.inventory-info {
		@apply flex items-center justify-between pt-2 text-sm text-neutral-500;
	}
	.action-buttons {
		@apply mt-2 flex gap-4;
	}
	/* 
		   Form specific styles 
		   使用 flex-1 确保按钮填满剩余空间
		*/
	.buy-now-form {
		@apply flex-1;
	}
	.btn-buy {
		@apply flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-lg font-bold text-black transition-all duration-200 hover:bg-neutral-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70;
	}
	.btn-cart {
		@apply flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 py-4 text-lg font-bold text-white transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70;
	}
	.icon-sm {
		@apply h-5 w-5;
	}
	.product-details {
		@apply mt-24 border-t border-neutral-800 pt-10;
	}
	.tabs {
		@apply mb-10 flex gap-8 overflow-x-auto border-b border-neutral-800;
	}
	.tabs button {
		@apply relative pb-4 font-medium whitespace-nowrap text-neutral-500 transition-colors hover:text-neutral-200;
	}
	.tabs .tab-active {
		@apply text-white;
	}
	.tabs .tab-active::after {
		content: '';
		@apply absolute bottom-0 left-0 h-0.5 w-full bg-white shadow-[0_0_10px_white];
	}
	.detail-content {
		@apply grid grid-cols-1 gap-12 lg:grid-cols-3;
	}
	.rich-text {
		@apply text-base leading-loose text-neutral-400 lg:col-span-2;
	}
	.rich-text :global(p) {
		@apply mb-4;
	}
	.attributes-table {
		@apply h-fit rounded-2xl border border-neutral-800/50 bg-neutral-900/30 p-6 lg:col-span-1;
	}
	.attributes-table h3 {
		@apply mb-6 text-lg font-semibold text-white;
	}
	.table {
		@apply flex flex-col gap-0;
	}
	.row {
		@apply flex justify-between border-b border-neutral-800 py-3 text-sm last:border-0;
	}
	.label {
		@apply text-neutral-500;
	}
	.value {
		@apply text-right font-medium text-neutral-300;
	}
</style>
