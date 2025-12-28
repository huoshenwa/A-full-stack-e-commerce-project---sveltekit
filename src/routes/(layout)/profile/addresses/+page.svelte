<!-- src/routes/profile/addresses/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let addresses = $derived(data.addresses);
	let showForm = $state(false);

	async function handleDelete(addressId: string) {
		if (!confirm('确定删除此地址？')) return;

		await fetch(`/api/addresses/${addressId}`, {
			method: 'DELETE',
			credentials: 'include'
		});

		invalidateAll();
	}
</script>

<h1>收货地址管理</h1>

{#if form?.success}
	<p>操作成功</p>
{/if}

{#if form?.error}
	<p>{form.error}</p>
{/if}

<button onclick={() => (showForm = !showForm)}>
	{showForm ? '取消' : '添加新地址'}
</button>

{#if showForm}
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') {
					showForm = false;
				}
			};
		}}
	>
		<div>
			<label>
				收货人*:
				<input type="text" name="receiverName" required />
			</label>
		</div>

		<div>
			<label>
				手机号*:
				<input type="tel" name="receiverPhone" required />
			</label>
		</div>

		<div>
			<label>
				省份*:
				<input type="text" name="province" required />
			</label>
		</div>

		<div>
			<label>
				城市*:
				<input type="text" name="city" required />
			</label>
		</div>

		<div>
			<label>
				区/县:
				<input type="text" name="district" />
			</label>
		</div>

		<div>
			<label>
				街道:
				<input type="text" name="street" />
			</label>
		</div>

		<div>
			<label>
				详细地址*:
				<input type="text" name="detailAddress" required placeholder="如：XX小区XX号楼XX单元XX室" />
			</label>
		</div>

		<div>
			<label>
				邮政编码:
				<input type="text" name="postalCode" />
			</label>
		</div>

		<div>
			<label>
				地址标签:
				<select name="label">
					<option value="">请选择</option>
					<option value="家">家</option>
					<option value="公司">公司</option>
					<option value="学校">学校</option>
				</select>
			</label>
		</div>

		<div>
			<label>
				<input type="checkbox" name="isDefault" />
				设为默认地址
			</label>
		</div>

		<button type="submit">保存</button>
	</form>
{/if}

<h2>我的地址</h2>

{#if addresses.length === 0}
	<p>暂无收货地址</p>
{:else}
	{#each addresses as address (address.id)}
		<article>
			<div>
				<strong>{address.receiverName}</strong>
				<span>{address.receiverPhone}</span>
				{#if address.isDefault}
					<span>默认</span>
				{/if}
			</div>
			<p>
				{address.province}
				{address.city}
				{address.district}
				{address.street}
				{address.detailAddress}
			</p>
			{#if address.postalCode}
				<p>邮编: {address.postalCode}</p>
			{/if}
			{#if address.label}
				<span>{address.label}</span>
			{/if}
			<div>
				<button onclick={() => handleDelete(address.id)}>删除</button>
			</div>
		</article>
	{/each}
{/if}
