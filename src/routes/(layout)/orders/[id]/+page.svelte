<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { ArrowLeft, MapPin, Package, CreditCard, Check, X, AlertCircle } from '@lucide/svelte';
	let { data }: { data: PageData } = $props();
	let order = $derived(data.order);
	let processing = $state(false);
	// 状态定义
	const statusMap: Record<string, { label: string; step: number }> = {
		pending: { label: '待付款', step: 1 },
		paid: { label: '已付款', step: 2 },
		shipped: { label: '已发货', step: 3 },
		completed: { label: '已完成', step: 4 },
		cancelled: { label: '已取消', step: 0 }
	};
	const currentStatus = $derived(statusMap[order.status] || { label: '未知状态', step: 0 });
	async function handleAction(action: 'cancel' | 'complete') {
		const confirmMsg = action === 'cancel' ? '确定取消订单？' : '确认已收货？';
		if (!confirm(confirmMsg)) return;
		processing = true;
		try {
			const res = await fetch(`/api/orders/${order.id}/${action}`, { method: 'POST' });
			if (res.ok) {
				// 操作成功，刷新页面数据 (SvelteKit 会重新调用 load)
				await invalidateAll();
			} else {
				const err = await res.json();
				alert(err.error || '操作失败');
			}
		} catch (e) {
			console.error(e);
			alert('网络错误');
		} finally {
			processing = false;
		}
	}
</script>

<div class="detail-page">
	<div class="container">
		<!-- 头部导航 -->
		<div class="header-nav">
			<a href="/orders" class="back-link">
				<ArrowLeft class="w-4 h-4" />
				返回列表
			</a>
			<h1 class="page-title">订单详情</h1>
		</div>
		<!-- 状态进度条 (非取消状态显示) -->
		{#if order.status !== 'cancelled'}
			<div class="progress-bar">
				{#each [1, 2, 3, 4] as step}
					{@const labelMap = ['创建订单', '付款成功', '商家发货', '交易完成']}
					<div class="step-item" class:active={step <= currentStatus.step}>
						<div class="step-circle">
							{#if step < currentStatus.step}
								<Check class="w-4 h-4" />
							{:else}
								{step}
							{/if}
						</div>
						<span class="step-label">{labelMap[step - 1]}</span>
					</div>
					{#if step < 4}
						<div class="step-line" class:active={step < currentStatus.step}></div>
					{/if}
				{/each}
			</div>
		{/if}
		<!-- 状态提示 -->
		{#if order.status === 'cancelled'}
			<div class="alert-box cancelled">
				<X class="icon-lg" />
				<div>
					<h3 class="font-bold">订单已取消</h3>
					<p class="text-sm">如果这是一个误操作，请联系客服。</p>
				</div>
			</div>
		{:else if order.status === 'pending'}
			<div class="alert-box warning">
				<AlertCircle class="icon-lg" />
				<div>
					<h3 class="font-bold">等待付款</h3>
					<p class="text-sm">请在 24 小时内完成支付，否则订单将自动取消。</p>
				</div>
			</div>
		{/if}
		<!-- 订单商品列表 -->
		<div class="card">
			<div class="card-header">
				<h3>商品信息</h3>
				<span class="text-sm text-slate-500">共 {order.items?.length || 0} 件</span>
			</div>
			<div class="card-body">
				{#each order.items as item}
					<div class="product-row">
						<div class="product-img">
							<!-- 如果有图片则显示，无图片显示占位 -->
							{#if item.image}
								<img src={item.image} alt={item.productName} />
							{:else}
								<div class="img-placeholder"><Package class="w-6 h-6" /></div>
							{/if}
						</div>
						<div class="product-details">
							<h4 class="product-name">{item.productName}</h4>
							{#if item.variantName}
								<span class="text-xs text-slate-500">{item.variantName}</span>
							{/if}
							<div class="mt-2 flex justify-between items-center w-full">
								<span class="price">¥{item.price}</span>
								<span class="qty">x {item.quantity}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<!-- 收货信息 -->
		<div class="card">
			<div class="card-header">
				<h3>收货信息</h3>
			</div>
			<div class="card-body">
				<div class="address-block">
					<div class="receiver-info">
						<span class="font-bold text-slate-900">{order.shippingAddress.receiverName}</span>
						<span class="text-slate-600 ml-2">{order.shippingAddress.receiverPhone}</span>
					</div>
					<p class="address-text">
						{order.shippingAddress.province}
						{order.shippingAddress.city}
						{order.shippingAddress.district}
						{order.shippingAddress.detailAddress}
					</p>
				</div>
			</div>
		</div>
		<!-- 支付信息 -->
		<div class="card">
			<div class="card-header">
				<h3>支付详情</h3>
			</div>
			<div class="card-body">
				<div class="bill-row">
					<span class="label">订单总额</span>
					<span class="value">¥{order.paymentAmount}</span>
				</div>
				<div class="bill-row">
					<span class="label">下单时间</span>
					<span class="value">{new Date(order.createdAt).toLocaleString()}</span>
				</div>
				<div class="bill-row">
					<span class="label">订单编号</span>
					<span class="value font-mono text-slate-600">{order.orderNo}</span>
				</div>
			</div>
		</div>
		<!-- 底部操作栏 -->
		{#if order.status !== 'cancelled' && order.status !== 'completed'}
			<div class="footer-actions">
				<div class="total-price-mobile">
					实付: <span class="amount">¥{order.paymentAmount}</span>
				</div>
				<div class="buttons">
					{#if order.status === 'pending'}
						<button
							class="btn-outline"
							onclick={() => handleAction('cancel')}
							disabled={processing}
						>
							取消订单
						</button>
						<button class="btn-primary"> 去支付 </button>
					{:else if order.status === 'shipped'}
						<button
							class="btn-primary"
							onclick={() => handleAction('complete')}
							disabled={processing}
						>
							{processing ? '处理中...' : '确认收货'}
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@reference '../../../layout.css';
	.detail-page {
		@apply min-h-screen bg-slate-50 pb-24;
	}
	.container {
		@apply mx-auto max-w-3xl px-4 py-6;
	}
	/* Header */
	.header-nav {
		@apply mb-6 flex items-center gap-4;
	}
	.back-link {
		@apply flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900;
	}
	.page-title {
		@apply text-xl font-bold text-slate-900;
	}
	/* Progress Bar */
	.progress-bar {
		@apply mb-8 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-6 shadow-sm;
	}
	.step-item {
		@apply relative z-10 flex flex-col items-center gap-2;
	}
	.step-circle {
		@apply flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400 transition-colors;
	}
	.step-item.active .step-circle {
		@apply bg-indigo-600 text-white;
	}
	.step-label {
		@apply text-xs font-medium text-slate-500;
	}
	.step-item.active .step-label {
		@apply text-indigo-600;
	}
	.step-line {
		@apply mx-2 h-1 flex-1 bg-slate-100;
	}
	.step-line.active {
		@apply bg-indigo-600;
	}
	/* Alerts */
	.alert-box {
		@apply mb-6 flex items-start gap-3 rounded-xl border p-4;
	}
	.alert-box.cancelled {
		@apply border-slate-200 bg-slate-100 text-slate-600;
	}
	.alert-box.warning {
		@apply border-amber-100 bg-amber-50 text-amber-800;
	}
	.icon-lg {
		@apply mt-0.5 h-5 w-5 flex-shrink-0;
	}
	/* Cards */
	.card {
		@apply mb-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm;
	}
	.card-header {
		@apply flex items-center justify-between border-b border-slate-50 px-5 py-4;
	}
	.card-header h3 {
		@apply font-bold text-slate-900;
	}
	.card-body {
		@apply p-5;
	}
	/* Product Row */
	.product-row {
		@apply mb-4 flex gap-4 last:mb-0;
	}
	.product-img {
		@apply h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100;
	}
	.product-img img {
		@apply h-full w-full object-cover;
	}
	.img-placeholder {
		@apply flex h-full w-full items-center justify-center text-slate-400;
	}
	.product-details {
		@apply flex flex-1 flex-col justify-between;
	}
	.product-name {
		@apply text-base leading-tight font-medium text-slate-900;
	}
	.price {
		@apply font-bold text-slate-900;
	}
	.qty {
		@apply text-sm text-slate-500;
	}
	/* Address */
	.address-block {
		@apply flex flex-col gap-2;
	}
	.receiver-info {
		@apply text-base;
	}
	.address-text {
		@apply text-sm leading-relaxed text-slate-600;
	}
	/* Bill Info */
	.bill-row {
		@apply mb-3 flex justify-between text-sm last:mb-0;
	}
	.label {
		@apply text-slate-500;
	}
	.value {
		@apply font-medium text-slate-900;
	}
	/* Footer Actions */
	.footer-actions {
		@apply fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:static md:mt-8 md:border-none md:bg-transparent md:p-0 md:shadow-none;
	}
	.total-price-mobile {
		@apply text-lg font-bold text-slate-900;
	}
	.total-price-mobile .amount {
		@apply text-2xl;
	}
	.buttons {
		@apply flex gap-3;
	}
	.btn-outline {
		@apply rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50;
	}
	.btn-primary {
		@apply rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
