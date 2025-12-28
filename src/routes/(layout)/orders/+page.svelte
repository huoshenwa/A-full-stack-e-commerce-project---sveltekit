<!-- src/routes/orders/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let orders = $derived(data.orders);
	let filters = $derived(data.filters);

	const statusMap: Record<string, string> = {
		pending: '待付款',
		paid: '已付款',
		shipped: '已发货',
		completed: '已完成',
		cancelled: '已取消'
	};
</script>

<h1>我的订单</h1>

<nav>
	<a href="/orders" class:active={!filters.status}>全部</a>
	<a href="/orders?status=pending" class:active={filters.status === 'pending'}>待付款</a>
	<a href="/orders?status=paid" class:active={filters.status === 'paid'}>待发货</a>
	<a href="/orders?status=shipped" class:active={filters.status === 'shipped'}>待收货</a>
	<a href="/orders?status=completed" class:active={filters.status === 'completed'}>已完成</a>
</nav>

{#if orders.length === 0}
	<p>暂无订单</p>
{:else}
	{#each orders as order (order.id)}
		<article>
			<div>
				<span>订单号: {order.orderNo}</span>
				<span>状态: {statusMap[order.status]}</span>
				<span>创建时间: {new Date(order.createdAt).toLocaleString()}</span>
			</div>

			<div>
				<p>收货人: {order.shippingAddress.receiverName} {order.shippingAddress.receiverPhone}</p>
				<p>
					收货地址: {order.shippingAddress.province}
					{order.shippingAddress.city}
					{order.shippingAddress.district}
					{order.shippingAddress.detailAddress}
				</p>
			</div>

			<div>
				<p>实付金额: ¥{order.paymentAmount}</p>
			</div>

			<div>
				<a href="/orders/{order.id}">查看详情</a>

				{#if order.status === 'pending'}
					<button>去支付</button>
					<button>取消订单</button>
				{/if}

				{#if order.status === 'shipped'}
					<button>确认收货</button>
				{/if}
			</div>
		</article>
	{/each}
{/if}

<style>
	.active {
		font-weight: bold;
	}
</style>
