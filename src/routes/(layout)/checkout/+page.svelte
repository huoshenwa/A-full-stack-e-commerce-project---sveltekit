<!-- src/routes/checkout/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let items = $derived(data.items);
	let addresses = $derived(data.addresses);

	let selectedAddressId = $state(addresses.find((a: any) => a.isDefault)?.id || addresses[0]?.id);

	let totalAmount = $derived(
		items.reduce((sum: number, item: any) => {
			const price = parseFloat(item.variantPrice || item.productPrice || '0');
			return sum + price * item.quantity;
		}, 0)
	);

	let shippingFee = $derived(totalAmount >= 99 ? 0 : 10);
	let paymentAmount = $derived(totalAmount + shippingFee);
</script>

<h1>确认订单</h1>

{#if form?.error}
	<p>{form.error}</p>
{/if}

<h2>收货地址</h2>
{#if addresses.length === 0}
	<p>没有收货地址，<a href="/profile/addresses/new">添加地址</a></p>
{:else}
	{#each addresses as address (address.id)}
		<label>
			<input type="radio" name="address" value={address.id} bind:group={selectedAddressId} />
			<div>
				<strong>{address.receiverName} {address.receiverPhone}</strong>
				<p>
					{address.province}
					{address.city}
					{address.district}
					{address.street}
					{address.detailAddress}
				</p>
				{#if address.isDefault}
					<span>默认地址</span>
				{/if}
			</div>
		</label>
	{/each}
{/if}

<h2>商品清单</h2>
<table>
	<thead>
		<tr>
			<th>商品</th>
			<th>单价</th>
			<th>数量</th>
			<th>小计</th>
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr>
				<td>
					{item.productName}
					{#if item.variantName}
						<br /><small>{item.variantName}</small>
					{/if}
				</td>
				<td>¥{item.variantPrice || item.productPrice}</td>
				<td>{item.quantity}</td>
				<td>
					¥{(parseFloat(item.variantPrice || item.productPrice || '0') * item.quantity).toFixed(2)}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>订单金额</h2>
<dl>
	<dt>商品总价:</dt>
	<dd>¥{totalAmount.toFixed(2)}</dd>

	<dt>运费:</dt>
	<dd>¥{shippingFee.toFixed(2)}</dd>

	<dt><strong>应付金额:</strong></dt>
	<dd><strong>¥{paymentAmount.toFixed(2)}</strong></dd>
</dl>

<form method="POST" use:enhance>
	<input type="hidden" name="addressId" value={selectedAddressId} />

	<div>
		<label>
			买家留言:
			<textarea name="buyerMessage" placeholder="选填，可告知商家您的特殊需求"></textarea>
		</label>
	</div>

	<button type="submit">提交订单</button>
</form>
