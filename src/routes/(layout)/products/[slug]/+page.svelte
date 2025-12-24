<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let product = $derived(data.product);

	// 状态管理：当前展示的主图索引
	let activeImageIndex = $state(0);
	// 状态管理：选中的规格
	let selectedVariantId = $state(product.variants?.[0]?.id || null);

	// 派生状态：当前选中的规格详情
	let selectedVariant = $derived(product.variants?.find((v) => v.id === selectedVariantId) || null);
</script>

<div class="product-page">
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
				<span class="current-price">¥{selectedVariant?.price || product.price}</span>
				{#if product.compareAtPrice}
					<span class="old-price">¥{product.compareAtPrice}</span>
				{/if}
			</div>

			<hr />

			{#if product.variants && product.variants.length > 0}
				<div class="variants-section">
					<h3>选择规格</h3>
					<div class="variant-grid">
						{#each product.variants as variant}
							<button
								class="variant-chip"
								class:selected={selectedVariantId === variant.id}
								onclick={() => (selectedVariantId = variant.id)}
							>
								{variant.name}
								<span class="v-price">¥{variant.price}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="inventory-info">
				库存: {selectedVariant?.stock ?? product.stock} 件
				<span class="sku">SKU: {selectedVariant?.sku ?? product.sku ?? 'N/A'}</span>
			</div>

			<div class="action-buttons">
				<button class="btn-buy">立即购买</button>
				<button class="btn-cart">加入购物车</button>
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

<style>
	.product-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px;
	}

	.product-hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 60px;
		margin-bottom: 80px;
	}

	/* 媒体区样式 */
	.media-gallery {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.main-image {
		aspect-ratio: 1/1;
		background: #f9f9f9;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #eee;
	}
	.main-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.thumbnail-list {
		display: flex;
		gap: 12px;
		overflow-x: auto;
	}
	.thumb-btn {
		width: 80px;
		height: 80px;
		border: 2px solid transparent;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		background: #fff;
		padding: 0;
	}
	.thumb-btn.active {
		border-color: var(--primary);
	}
	.thumb-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* 购买区样式 */
	.breadcrumb {
		font-size: 0.85rem;
		color: #888;
		margin-bottom: 15px;
	}
	.title {
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -1px;
		margin: 0 0 15px 0;
	}

	.stats-row {
		display: flex;
		align-items: center;
		gap: 15px;
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 25px;
	}
	.rating {
		color: #f5a623;
		font-weight: 700;
	}

	.short-desc {
		color: #666;
		line-height: 1.6;
		margin-bottom: 30px;
	}

	.price-section {
		display: flex;
		align-items: baseline;
		gap: 15px;
		margin-bottom: 30px;
	}
	.current-price {
		font-size: 2rem;
		font-weight: 700;
		color: #000;
	}
	.old-price {
		text-decoration: line-through;
		color: #aaa;
		font-size: 1.2rem;
	}

	hr {
		border: 0;
		border-top: 1px solid #eee;
		margin: 30px 0;
	}

	.variant-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 15px;
	}
	.variant-chip {
		padding: 12px 20px;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: #fff;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		transition: all 0.2s;
	}
	.variant-chip.selected {
		border-color: #000;
		background: #fafafa;
		box-shadow: 0 0 0 1px #000;
	}
	.v-price {
		font-size: 0.8rem;
		color: #888;
		margin-top: 4px;
	}

	.inventory-info {
		margin: 25px 0;
		font-size: 0.9rem;
		color: #888;
	}
	.sku {
		margin-left: 20px;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
	}
	.btn-buy {
		background: #000;
		color: #fff;
		border: none;
		padding: 18px;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.btn-cart {
		background: #fff;
		color: #000;
		border: 1px solid #000;
		padding: 18px;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.btn-buy:hover {
		opacity: 0.8;
	}

	/* 详情区样式 */
	.product-details {
		border-top: 1px solid #eee;
		padding-top: 60px;
	}
	.tabs {
		display: flex;
		gap: 40px;
		border-bottom: 1px solid #eee;
		margin-bottom: 40px;
	}
	.tabs button {
		background: none;
		border: none;
		padding: 15px 0;
		font-size: 1.1rem;
		color: #888;
		cursor: pointer;
		position: relative;
	}
	.tabs .tab-active {
		color: #000;
		font-weight: 700;
	}
	.tabs .tab-active::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 2px;
		background: #000;
	}

	.detail-content {
		max-width: 800px;
		margin: 0 auto;
	}
	.rich-text :global(img) {
		max-width: 100%;
		border-radius: 8px;
		margin: 20px 0;
	}
	.rich-text :global(p) {
		line-height: 1.8;
		color: #333;
	}

	.attributes-table {
		margin-top: 40px;
		background: #f9f9f9;
		padding: 30px;
		border-radius: 12px;
	}
	.table {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	.row {
		display: flex;
		border-bottom: 1px solid #eee;
		padding-bottom: 10px;
	}
	.label {
		width: 120px;
		color: #888;
		font-size: 0.9rem;
	}
	.value {
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.product-hero {
			grid-template-columns: 1fr;
			gap: 30px;
		}
	}
</style>
