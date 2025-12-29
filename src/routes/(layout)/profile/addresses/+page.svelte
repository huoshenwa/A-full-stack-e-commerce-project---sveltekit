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
<div class="feedback-container">
	{#if form?.success}
		<p class="feedback-message feedback-success">操作成功</p>
	{/if}
	{#if form?.error}
		<p class="feedback-message feedback-error">{form.error}</p>
	{/if}
</div>
<div class="actions-bar">
	<button onclick={() => (showForm = !showForm)} class="btn btn-primary">
		{showForm ? '取消' : '添加新地址'}
	</button>
</div>
{#if showForm}
	<div class="form-wrapper">
		<form
			method="POST"
			action="?/create"
			class="address-form"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') {
						showForm = false;
					}
				};
			}}
		>
			<div class="form-grid">
				<div class="form-group">
					<label for="receiverName">收货人</label>
					<input type="text" name="receiverName" required placeholder="请输入姓名" />
				</div>
				<div class="form-group">
					<label for="receiverPhone">手机号</label>
					<input type="tel" name="receiverPhone" required placeholder="请输入手机号" />
				</div>
				<div class="form-group">
					<label for="province">省份</label>
					<input type="text" name="province" required placeholder="如：广东省" />
				</div>
				<div class="form-group">
					<label for="city">城市</label>
					<input type="text" name="city" required placeholder="如：深圳市" />
				</div>
				<div class="form-group">
					<label for="district">区/县</label>
					<input type="text" name="district" placeholder="如：南山区" />
				</div>
				<div class="form-group">
					<label for="street">街道</label>
					<input type="text" name="street" placeholder="如：科技园路" />
				</div>
				<div class="form-group form-group-full">
					<label for="detailAddress">详细地址</label>
					<input
						type="text"
						name="detailAddress"
						required
						placeholder="如：XX小区XX号楼XX单元XX室"
					/>
				</div>
				<div class="form-group">
					<label for="postalCode">邮政编码</label>
					<input type="text" name="postalCode" placeholder="如：518000" />
				</div>
				<div class="form-group">
					<label for="label">地址标签</label>
					<select name="label">
						<option value="">请选择</option>
						<option value="家">家</option>
						<option value="公司">公司</option>
						<option value="学校">学校</option>
					</select>
				</div>
				<div class="form-group form-group-checkbox">
					<label class="checkbox-label">
						<input type="checkbox" name="isDefault" class="checkbox-input" />
						<span>设为默认地址</span>
					</label>
				</div>
			</div>
			<div class="form-actions">
				<button type="submit" class="btn btn-submit">保存地址</button>
			</div>
		</form>
	</div>
{/if}
<h2>我的地址</h2>
{#if addresses.length === 0}
	<div class="empty-state">
		<p>暂无收货地址</p>
	</div>
{:else}
	<div class="address-list">
		{#each addresses as address (address.id)}
			<article class="address-card">
				<div class="address-header">
					<div class="receiver-info">
						<strong>{address.receiverName}</strong>
						<span>{address.receiverPhone}</span>
					</div>
					{#if address.isDefault}
						<span class="badge badge-default">默认</span>
					{/if}
				</div>
				<div class="address-body">
					<p class="address-lines">
						{address.province}
						{address.city}
						{address.district}
						{address.street}
						<span class="detail-highlight">{address.detailAddress}</span>
					</p>
					{#if address.postalCode}
						<p class="postal-code">邮编: {address.postalCode}</p>
					{/if}
					{#if address.label}
						<span class="badge badge-label">{address.label}</span>
					{/if}
				</div>
				<div class="address-footer">
					<button onclick={() => handleDelete(address.id)} class="btn btn-delete" type="button">
						删除
					</button>
				</div>
			</article>
		{/each}
	</div>
{/if}

<style>
	@reference '../../../layout.css';
	/* 页面整体布局 */
	:global(body) {
		@apply min-h-screen bg-slate-950 p-4 font-sans text-slate-50 antialiased selection:bg-cyan-500/30 md:p-8;
	}
	/* 标题样式 */
	h1 {
		@apply mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent;
	}
	h2 {
		@apply mt-10 mb-4 border-b border-slate-800 pb-2 text-xl font-semibold text-slate-200;
	}
	/* 反馈消息 */
	.feedback-message {
		@apply mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-opacity duration-300;
	}
	.feedback-success {
		@apply border border-green-900/50 bg-green-900/20 text-green-400;
	}
	.feedback-error {
		@apply border border-red-900/50 bg-red-900/20 text-red-400;
	}
	/* 顶部操作栏 */
	.actions-bar {
		@apply mb-6 flex justify-end;
	}
	/* 按钮组件 */
	.btn {
		@apply cursor-pointer rounded-lg border-none px-5 py-2.5 font-medium transition-all duration-200 select-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:outline-none active:scale-95;
	}
	.btn-primary {
		@apply bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] focus:ring-cyan-500;
	}
	.btn-submit {
		@apply w-full bg-blue-600 py-3 text-lg font-bold text-white shadow-lg hover:bg-blue-500 focus:ring-blue-500;
	}
	.btn-delete {
		@apply border border-red-900/50 bg-transparent px-4 py-1.5 text-sm text-red-400 transition-colors hover:border-red-600 hover:bg-red-900/20 hover:text-red-300 focus:ring-red-500;
	}
	/* 表单容器与网格 */
	.form-wrapper {
		@apply mb-8 rounded-2xl border border-slate-800/50 bg-slate-900 p-6 shadow-2xl backdrop-blur-sm md:p-8;
	}
	.form-grid {
		@apply grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2;
	}
	.form-group {
		@apply flex flex-col gap-2;
	}
	.form-group-full {
		@apply md:col-span-2;
	}
	.form-group-checkbox {
		@apply h-full flex-row items-center justify-start pt-6;
	}
	/* 输入框与标签 */
	label {
		@apply text-sm font-medium text-slate-400;
	}
	input[type='text'],
	input[type='tel'],
	select {
		@apply w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder-slate-600 transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none;
	}
	.checkbox-label {
		@apply flex cursor-pointer items-center gap-3 select-none;
	}
	.checkbox-input {
		@apply h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-900 text-cyan-500 accent-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950;
	}
	.form-actions {
		@apply mt-8 flex justify-center md:col-span-2;
	}
	/* 地址列表 */
	.address-list {
		@apply grid grid-cols-1 gap-6 lg:grid-cols-2;
	}
	.empty-state {
		@apply rounded-xl border border-dashed border-slate-800 bg-slate-900 py-12 text-center text-slate-500;
	}
	/* 地址卡片 */
	.address-card {
		@apply relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-cyan-900/10;
	}
	/* 卡片光效装饰 */
	.address-card::before {
		content: '';
		@apply absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 transition-opacity duration-300;
	}
	.address-card:hover::before {
		@apply opacity-100;
	}
	.address-header {
		@apply mb-3 flex items-start justify-between;
	}
	.receiver-info {
		@apply flex items-baseline gap-3;
	}
	.receiver-info strong {
		@apply text-lg text-slate-100;
	}
	.receiver-info span {
		@apply font-mono text-sm text-slate-400;
	}
	.badge {
		@apply rounded border px-2.5 py-0.5 text-xs font-medium;
	}
	.badge-default {
		@apply border-cyan-900/50 bg-cyan-950/50 text-cyan-400;
	}
	.badge-label {
		@apply mt-2 inline-block bg-slate-800 text-slate-300;
	}
	/* 地址内容 */
	.address-body {
		@apply mb-4 flex-grow;
	}
	.address-lines {
		@apply mb-2 leading-relaxed text-slate-300;
	}
	.detail-highlight {
		@apply pl-1 font-medium text-slate-100;
	}
	.postal-code {
		@apply text-xs tracking-wider text-slate-500 uppercase;
	}
	/* 卡片底部 */
	.address-footer {
		@apply flex justify-end border-t border-slate-800/50 pt-4;
	}
</style>
