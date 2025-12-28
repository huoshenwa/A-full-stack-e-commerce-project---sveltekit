<!-- src/routes/cart/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

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

<h1>购物车</h1>

{#if items.length === 0}
	<p>购物车是空的</p>
	<a href="/">去逛逛</a>
{:else}
	<table>
		<thead>
			<tr>
				<th>选择</th>
				<th>商品</th>
				<th>单价</th>
				<th>数量</th>
				<th>小计</th>
				<th>操作</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item (item.id)}
				<tr>
					<td>
						<input
							type="checkbox"
							checked={item.isSelected}
							onchange={(e) => toggleSelected(item.id, e.currentTarget.checked)}
						/>
					</td>
					<td>
						<a href="/products/{item.productSlug}">
							{item.productName}
							{#if item.variantName}
								<br /><small>{item.variantName}</small>
							{/if}
						</a>
					</td>
					<td>¥{item.variantPrice || item.productPrice}</td>
					<td>
						<button onclick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
						{item.quantity}
						<button onclick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
					</td>
					<td>
						¥{(parseFloat(item.variantPrice || item.productPrice || '0') * item.quantity).toFixed(
							2
						)}
					</td>
					<td>
						<button onclick={() => removeItem(item.id)}>删除</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div>
		<p>已选 {selectedCount} 件商品</p>
		<p>总计: ¥{totalAmount.toFixed(2)}</p>

		{#if selectedCount > 0}
			<a href="/checkout">去结算</a>
		{/if}
	</div>
{/if}
