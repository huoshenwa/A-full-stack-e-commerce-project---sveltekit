<!-- src/routes/cart/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, Circle } from '@lucide/svelte';
	let { data }: { data: PageData } = $props();
	let items = $derived(data.items);
	// 计算总价
	let totalAmount = $derived(
		items
			.filter((item) => item.isSelected)
			.reduce((sum, item) => {
				const price = parseFloat(item.variantPrice || item.productPrice || '0');
				return sum + price * item.quantity;
			}, 0)
	);
	let selectedCount = $derived(items.filter((item) => item.isSelected).length);
	async function updateQuantity(itemId: string, quantity: number) {
		if (quantity < 1) return;
		await fetch(`/api/cart/${itemId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ quantity })
		});
		invalidateAll();
	}
	async function toggleSelected(itemId: string, isSelected: boolean) {
		await fetch(`/api/cart/${itemId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ isSelected })
		});
		invalidateAll();
	}
	async function removeItem(itemId: string) {
		if (!confirm('确定删除此商品？')) return;
		await fetch(`/api/cart/${itemId}`, {
			method: 'DELETE',
			credentials: 'include'
		});
		invalidateAll();
	}
</script>

<div class="cart-page">
	<div class="cart-container">
		<div class="page-header">
			<h1 class="page-title">购物车</h1>
			<span class="page-badge">{items.length} 件商品</span>
		</div>
		{#if items.length === 0}
			<div class="empty-state">
				<div class="empty-icon-wrapper">
					<ShoppingCart class="empty-icon" />
				</div>
				<h2 class="empty-title">购物车是空的</h2>
				<p class="empty-desc">快去添加一些心仪的商品吧</p>
				<a href="/products" class="btn-primary">去逛逛</a>
			</div>
		{:else}
			<div class="cart-items-list">
				{#each items as item (item.id)}
					<!-- group 类保留在 HTML 中以支持 Svelte style block 中的 :group-hover -->
					<div class="cart-item-card group">
						<div class="item-select-area">
							<label class="checkbox-label">
								<input
									type="checkbox"
									class="hidden-checkbox"
									checked={item.isSelected}
									onchange={(e) => toggleSelected(item.id, e.currentTarget.checked)}
								/>
								<div class="checkbox-visual">
									{#if item.isSelected}
										<CheckCircle class="icon-check" />
									{:else}
										<Circle class="icon-uncheck" />
									{/if}
								</div>
							</label>
						</div>
						<div class="item-content">
							<!-- group 类保留在 HTML 中以支持子元素的 hover 效果 -->
							<a href="/products/{item.productSlug}" class="product-image-wrapper group">
								<div class="product-placeholder">
									<span class="product-initial">
										{item.productName?.charAt(0) || 'P'}
									</span>
								</div>
							</a>
							<div class="product-info">
								<!-- group 类保留在 HTML 中以支持标题 hover 变色 -->
								<a href="/products/{item.productSlug}" class="product-link group">
									<h3 class="product-name">{item.productName}</h3>
									{#if item.variantName}
										<span class="product-variant">{item.variantName}</span>
									{/if}
								</a>
								<div class="price-mobile">¥{item.variantPrice || item.productPrice}</div>
							</div>
							<div class="item-actions-area">
								<div class="price-desktop">
									¥{item.variantPrice || item.productPrice}
								</div>
								<div class="quantity-wrapper">
									<button
										class="qty-btn"
										onclick={() => updateQuantity(item.id, item.quantity - 1)}
										aria-label="减少数量"
									>
										<Minus class="qty-icon" />
									</button>
									<span class="qty-value">{item.quantity}</span>
									<button
										class="qty-btn"
										onclick={() => updateQuantity(item.id, item.quantity + 1)}
										aria-label="增加数量"
									>
										<Plus class="qty-icon" />
									</button>
								</div>
								<div class="item-subtotal">
									¥{(
										parseFloat(item.variantPrice || item.productPrice || '0') * item.quantity
									).toFixed(2)}
								</div>
								<button
									class="delete-btn"
									onclick={() => removeItem(item.id)}
									aria-label="删除商品"
								>
									<Trash2 class="delete-icon" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="cart-footer-bar">
				<div class="footer-content">
					<div class="footer-info">
						<div class="selected-text">
							已选 <span class="highlight-count">{selectedCount}</span> 件商品
						</div>
						<div class="total-wrapper">
							<span class="total-label">合计:</span>
							<span class="total-price">¥{totalAmount.toFixed(2)}</span>
						</div>
					</div>
					{#if selectedCount > 0}
						<a href="/checkout" class="checkout-btn">去结算</a>
					{:else}
						<div class="checkout-btn disabled">去结算</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@reference '../../layout.css';
	/* 
	     * Tailwind CSS 4 Implementation via @apply
	     * Design Philosophy: Intentional Minimalism
	     * 注意：`group` 类已保留在 HTML 标签中，此处使用 :group-hover 等伪类
	     */
	.cart-page {
		@apply min-h-screen bg-slate-50 pb-32 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 md:pb-12;
	}
	.cart-container {
		@apply mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12;
	}
	/* Header */
	.page-header {
		@apply mb-8 flex items-center justify-between border-b border-slate-200 pb-4;
	}
	.page-title {
		@apply text-2xl font-bold tracking-tight text-slate-900 md:text-3xl;
	}
	.page-badge {
		@apply rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500;
	}
	/* Empty State */
	.empty-state {
		@apply flex flex-col items-center justify-center py-20 text-center;
	}
	.empty-icon-wrapper {
		@apply mb-6 rounded-full bg-indigo-50 p-4 text-indigo-400;
	}
	.empty-icon {
		@apply h-12 w-12 md:h-16 md:w-16;
	}
	.empty-title {
		@apply mb-2 text-xl font-semibold text-slate-900;
	}
	.empty-desc {
		@apply mb-8 text-slate-500;
	}
	/* Button Utilities */
	.btn-primary {
		@apply inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3 font-medium text-white transition-all hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none active:scale-95;
	}
	/* Cart Items List */
	.cart-items-list {
		@apply space-y-4;
	}
	.cart-item-card {
		@apply flex flex-col items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 md:flex-row md:items-center md:gap-6;
	}
	/* Group Hover Effects for Card */
	.cart-item-card:hover {
		@apply border-slate-200 shadow-md;
	}
	/* Checkbox Customization */
	.item-select-area {
		@apply pt-1 md:pt-0;
	}
	.checkbox-label {
		@apply relative flex cursor-pointer items-center;
	}
	.hidden-checkbox {
		@apply sr-only;
	}
	.checkbox-visual {
		@apply text-slate-300 transition-colors hover:text-indigo-400;
	}
	.icon-check {
		@apply h-6 w-6 fill-indigo-50 text-indigo-600;
	}
	.icon-uncheck {
		@apply h-6 w-6;
	}
	/* Item Content */
	.item-content {
		@apply flex w-full flex-1 gap-4 md:gap-6;
	}
	.product-image-wrapper {
		@apply relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 md:h-24 md:w-24;
	}
	.product-placeholder {
		@apply flex h-full w-full items-center justify-center bg-slate-100 text-slate-300;
	}
	/* Hover effect for placeholder needs group on parent link */
	:global(.group:hover .product-placeholder) {
		@apply bg-slate-200;
	}
	.product-initial {
		@apply text-xl font-bold;
	}
	.product-info {
		@apply flex min-w-0 flex-1 flex-col justify-center;
	}
	.product-link {
		@apply block transition-opacity;
	}
	.product-name {
		@apply mb-1 truncate text-base font-semibold text-slate-900;
	}
	/* Hover effect for name text needs group on parent link */
	:global(.group:hover .product-name) {
		@apply text-indigo-600;
	}
	.product-variant {
		@apply block text-sm text-slate-500;
	}
	.price-mobile {
		@apply mt-2 text-sm font-semibold text-slate-900 md:hidden;
	}
	/* Actions Area */
	.item-actions-area {
		@apply mt-2 ml-0 flex w-full flex-row-reverse items-center justify-between gap-4 md:mt-0 md:ml-auto md:w-auto md:flex-row md:justify-end md:gap-8;
	}
	.price-desktop {
		@apply hidden w-16 text-right text-sm font-medium text-slate-500 md:block;
	}
	.quantity-wrapper {
		@apply flex w-24 items-center overflow-hidden rounded-lg border border-slate-200 md:w-32;
	}
	.qty-btn {
		@apply flex h-8 w-8 items-center justify-center bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 md:h-10 md:w-10;
	}
	.qty-icon {
		@apply h-4 w-4;
	}
	.qty-value {
		@apply flex-1 text-center text-sm font-medium text-slate-900;
	}
	.item-subtotal {
		@apply hidden w-20 text-right text-base font-bold text-slate-900 md:block;
	}
	.delete-btn {
		@apply ml-auto rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 md:ml-0;
	}
	.delete-icon {
		@apply h-5 w-5;
	}
	/* Footer Summary Bar */
	.cart-footer-bar {
		@apply fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/90 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-lg md:static md:mt-8 md:mb-4 md:border-none md:bg-transparent md:p-0 md:shadow-none;
	}
	.footer-content {
		@apply mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 md:justify-end;
	}
	.footer-info {
		@apply flex flex-col gap-1 md:flex-row md:items-center md:gap-6;
	}
	.selected-text {
		@apply text-sm text-slate-500 md:text-base;
	}
	.highlight-count {
		@apply font-semibold text-slate-900;
	}
	.total-wrapper {
		@apply flex items-baseline gap-1;
	}
	.total-label {
		@apply text-sm font-medium text-slate-500;
	}
	.total-price {
		@apply text-xl font-bold text-slate-900 md:text-2xl;
	}
	.checkout-btn {
		@apply rounded-xl bg-indigo-600 px-8 py-3 font-semibold whitespace-nowrap text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none active:scale-95;
	}
	.checkout-btn.disabled {
		@apply pointer-events-none cursor-not-allowed bg-slate-200 text-slate-400 shadow-none hover:bg-slate-200;
	}
</style>
