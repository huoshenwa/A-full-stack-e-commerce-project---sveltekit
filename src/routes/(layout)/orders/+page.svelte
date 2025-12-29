<!-- src/routes/orders/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { Package, MapPin, ChevronRight, Inbox, AlertCircle } from '@lucide/svelte';
	let { data }: { data: PageData } = $props();
	let orders = $derived(data.orders);
	let filters = $derived(data.filters);
	// 状态映射
	const statusMap: Record<string, { label: string; colorClass: string; bgClass: string }> = {
		pending: {
			label: '待付款',
			colorClass: 'text-amber-700',
			bgClass: 'bg-amber-50 border-amber-100'
		},
		paid: { label: '已付款', colorClass: 'text-blue-700', bgClass: 'bg-blue-50 border-blue-100' },
		shipped: {
			label: '已发货',
			colorClass: 'text-indigo-700',
			bgClass: 'bg-indigo-50 border-indigo-100'
		},
		completed: {
			label: '已完成',
			colorClass: 'text-emerald-700',
			bgClass: 'bg-emerald-50 border-emerald-100'
		},
		cancelled: {
			label: '已取消',
			colorClass: 'text-slate-500',
			bgClass: 'bg-slate-50 border-slate-100'
		}
	};
	// 加载状态
	let processingId = $state<string | null>(null);
	/**
	 * 通用错误处理
	 */
	async function handleApiResponse(res: Response, successMsg: string) {
		if (!res.ok) {
			try {
				const errData = await res.json();
				alert(`操作失败: ${errData.error || '未知错误'}`);
			} catch (e) {
				alert(`操作失败 (HTTP ${res.status})`);
			}
			return false;
		}
		return true;
	}
	/**
	 * 取消订单
	 */
	async function cancelOrder(orderId: string) {
		if (!confirm('确定要取消该订单吗？')) return;
		processingId = orderId;
		try {
			const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
			if (await handleApiResponse(res, '订单已取消')) {
				await invalidateAll();
			}
		} catch (e) {
			console.error(e);
			alert('网络错误，请稍后重试');
		} finally {
			processingId = null;
		}
	}
	/**
	 * 确认收货
	 */
	async function completeOrder(orderId: string) {
		if (!confirm('确认已收到商品？确认后订单将完成。')) return;
		processingId = orderId;
		try {
			const res = await fetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
			if (await handleApiResponse(res, '确认收货成功')) {
				await invalidateAll();
			}
		} catch (e) {
			console.error(e);
			alert('网络错误，请稍后重试');
		} finally {
			processingId = null;
		}
	}
</script>

<div class="orders-page">
	<div class="page-container">
		<div class="page-header">
			<h1 class="page-title">我的订单</h1>
		</div>
		<!-- 状态导航 Tabs -->
		<nav class="status-nav">
			{#each ['all', 'pending', 'paid', 'shipped', 'completed'] as status}
				{@const labelMap: Record<string, string> = {
						all: '全部',
						pending: '待付款',
						paid: '待发货',
						shipped: '待收货',
						completed: '已完成'
					}}
				<a
					href="/orders{status === 'all' ? '' : '?status=' + status}"
					class="nav-item"
					class:active={(!filters.status && status === 'all') || filters.status === status}
				>
					{labelMap[status]}
				</a>
			{/each}
		</nav>
		<!-- 订单列表 -->
		{#if orders.length === 0}
			<div class="empty-state">
				<Inbox class="empty-icon" />
				<h2 class="empty-title">暂无订单</h2>
				<p class="empty-desc">您还没有相关的订单记录</p>
				<a href="/products" class="btn-primary">去逛逛</a>
			</div>
		{:else}
			<div class="orders-list">
				{#each orders as order (order.id)}
					<article class="order-card">
						<!-- 卡片头部 -->
						<div class="card-header">
							<div class="order-meta">
								<span class="order-no">订单号: {order.orderNo}</span>
								<span class="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
							</div>
							<div class="status-badge {statusMap[order.status]?.bgClass}">
								<span class="status-text {statusMap[order.status]?.colorClass}">
									{statusMap[order.status]?.label || order.status}
								</span>
							</div>
						</div>
						<!-- 卡片内容 -->
						<div class="card-body">
							<div class="product-summary">
								<div class="product-thumb">
									<Package class="thumb-icon" />
								</div>
								<div class="product-info">
									<p class="product-count">
										{order.items?.length || 1} 件商品
									</p>
									{#if order.status !== 'cancelled'}
										<div class="address-row">
											<MapPin class="icon-xs text-slate-400" />
											<span class="text-xs text-slate-500 truncate">
												{order.shippingAddress.receiverName}
												{order.shippingAddress.receiverPhone}
											</span>
										</div>
									{/if}
								</div>
							</div>
							<div class="amount-section">
								<span class="amount-label">实付金额</span>
								<div class="amount-value">¥{order.paymentAmount}</div>
							</div>
						</div>
						<!-- 卡片底部：操作按钮 -->
						<div class="card-footer">
							<div class="footer-left">
								<a href="/orders/{order.id}" class="link-detail">
									查看详情 <ChevronRight class="icon-xs" />
								</a>
							</div>
							<div class="actions-right">
								{#if order.status === 'pending'}
									<button
										class="btn-secondary"
										onclick={() => cancelOrder(order.id)}
										disabled={processingId === order.id}
									>
										取消订单
									</button>
									<button class="btn-primary">去支付</button>
								{/if}
								{#if order.status === 'shipped'}
									<button
										class="btn-primary"
										onclick={() => completeOrder(order.id)}
										disabled={processingId === order.id}
									>
										{processingId === order.id ? '处理中...' : '确认收货'}
									</button>
								{/if}
								{#if order.status === 'completed'}
									<button class="btn-secondary">再次购买</button>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	@reference '../../layout.css';
	/* 样式保持不变 (复用之前的设计) */
	.orders-page {
		@apply min-h-screen bg-slate-50 pb-12 font-sans text-slate-900;
	}
	.page-container {
		@apply mx-auto max-w-4xl px-4 py-8 sm:px-6;
	}
	.page-header {
		@apply mb-6 flex items-center justify-between;
	}
	.page-title {
		@apply text-2xl font-bold tracking-tight text-slate-900;
	}
	.status-nav {
		@apply mb-8 flex gap-6 overflow-x-auto border-b border-slate-200;
	}
	.nav-item {
		@apply relative pb-4 text-sm font-medium whitespace-nowrap text-slate-500 transition-colors hover:text-slate-900;
	}
	.nav-item.active {
		@apply text-slate-900;
	}
	.nav-item.active::after {
		content: '';
		@apply absolute bottom-0 left-0 h-0.5 w-full bg-slate-900;
	}
	.empty-state {
		@apply flex flex-col items-center justify-center py-20 text-center;
	}
	.empty-icon {
		@apply mb-4 h-16 w-16 text-slate-300;
	}
	.empty-title {
		@apply mb-1 text-lg font-medium text-slate-900;
	}
	.empty-desc {
		@apply mb-6 text-slate-500;
	}
	.btn-primary {
		@apply rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800;
	}
	.orders-list {
		@apply space-y-4;
	}
	.order-card {
		@apply overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md;
	}
	.card-header {
		@apply flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4;
	}
	.order-meta {
		@apply flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3;
	}
	.order-no {
		@apply text-sm font-medium text-slate-900;
	}
	.order-date {
		@apply text-xs text-slate-500;
	}
	.status-badge {
		@apply rounded-full border px-3 py-1 text-xs font-medium;
	}
	.card-body {
		@apply flex items-center justify-between gap-4 p-5;
	}
	.product-summary {
		@apply flex items-center gap-4;
	}
	.product-thumb {
		@apply flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400;
	}
	.thumb-icon {
		@apply h-6 w-6;
	}
	.product-info {
		@apply flex flex-col gap-1;
	}
	.product-count {
		@apply text-sm font-medium text-slate-700;
	}
	.address-row {
		@apply flex max-w-[200px] items-center gap-1 sm:max-w-xs;
	}
	.amount-section {
		@apply flex-shrink-0 text-right;
	}
	.amount-label {
		@apply mb-1 block text-xs text-slate-500;
	}
	.amount-value {
		@apply text-lg font-bold text-slate-900;
	}
	.card-footer {
		@apply flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-5 py-4;
	}
	.footer-left {
		@apply min-w-0 flex-1;
	}
	.link-detail {
		@apply inline-flex items-center text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600;
	}
	.actions-right {
		@apply flex flex-shrink-0 items-center gap-3;
	}
	.btn-secondary {
		@apply rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50;
	}
	.btn-primary {
		@apply rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50;
	}
	.icon-xs {
		@apply h-3 w-3;
	}
</style>
