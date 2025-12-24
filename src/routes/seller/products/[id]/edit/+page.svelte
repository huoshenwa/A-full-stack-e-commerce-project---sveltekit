<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let product = $derived(data.product);
	let categories = $derived(data.categories);
</script>

<div class="edit-container">
	<nav class="breadcrumb">
		<a href="/seller">商家中心</a> / <span>编辑商品</span>
	</nav>

	<header class="page-header">
		<div class="header-info">
			<h1>{product.name}</h1>
			<p class="product-id-meta">内部 ID: {product.id}</p>
		</div>
		<div class="header-actions">
			<a href="/products/{product.slug}" target="_blank" class="btn-link">预览商品 ↗</a>
		</div>
	</header>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert success">保存成功，信息已同步更新。</div>
	{/if}

	<form method="POST" action="?/update" use:enhance class="main-form">
		<div class="form-card">
			<h2 class="card-title">基本信息</h2>

			<div class="field">
				<label for="name">商品名称</label>
				<input type="text" id="name" name="name" value={product.name} required />
			</div>

			<div class="field">
				<label for="slug">URL 标识 (Slug)</label>
				<div class="slug-input-group">
					<span class="url-prefix">/products/</span>
					<input type="text" id="slug" name="slug" value={product.slug} required />
				</div>
			</div>

			<div class="field">
				<label for="shortDescription">简短描述</label>
				<input
					type="text"
					id="shortDescription"
					name="shortDescription"
					value={product.shortDescription || ''}
				/>
			</div>

			<div class="field">
				<label for="description">详细描述 (HTML)</label>
				<textarea id="description" name="description" rows="12"
					>{product.description || ''}</textarea
				>
			</div>
		</div>

		<div class="form-card">
			<h2 class="card-title">价格与库存控制</h2>
			<div class="grid-row">
				<div class="field">
					<label for="price">当前价格 (¥)</label>
					<input type="number" id="price" name="price" step="0.01" value={product.price} required />
				</div>
				<div class="field">
					<label for="compareAtPrice">划线原价 (¥)</label>
					<input
						type="number"
						id="compareAtPrice"
						name="compareAtPrice"
						step="0.01"
						value={product.compareAtPrice || ''}
					/>
				</div>
			</div>

			<div class="grid-row">
				<div class="field">
					<label for="stock">库存余量</label>
					<input type="number" id="stock" name="stock" value={product.stock} required />
				</div>
				<div class="field">
					<label for="sku">SKU 编码</label>
					<input
						type="text"
						id="sku"
						name="sku"
						value={product.sku || ''}
						placeholder="例如: APL-I16P-BLK"
					/>
				</div>
			</div>
		</div>

		<div class="form-card">
			<h2 class="card-title">归类与组织</h2>
			<div class="field">
				<label for="categoryId">所属分类</label>
				<select id="categoryId" name="categoryId">
					<option value="">未分类</option>
					{#each categories as category}
						<option value={category.id} selected={category.id === product.categoryId}>
							{category.name}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="sticky-actions">
			<button type="submit" class="btn-save">保存更改</button>
		</div>
	</form>

	<div class="danger-zone">
		<div class="danger-info">
			<h3>危险区域</h3>
			<p>删除商品后不可恢复，相关销售数据也将被归档。</p>
		</div>
		<form method="POST" action="?/delete" use:enhance>
			<button
				type="submit"
				class="btn-delete"
				onclick={() => confirm('确定彻底删除此商品吗？此操作无法撤销。')}
			>
				删除商品
			</button>
		</form>
	</div>
</div>

<style>
	.edit-container {
		max-width: 800px;
		margin: 40px auto;
		padding: 0 20px;
		color: #1a1a1a;
		font-family: system-ui, sans-serif;
	}

	.breadcrumb {
		font-size: 13px;
		color: #888;
		margin-bottom: 20px;
	}
	.breadcrumb a {
		color: #888;
		text-decoration: none;
	}
	.breadcrumb a:hover {
		color: #000;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40px;
	}
	.page-header h1 {
		font-size: 28px;
		font-weight: 700;
		margin: 0;
	}
	.product-id-meta {
		font-size: 12px;
		color: #aaa;
		font-family: monospace;
		margin-top: 5px;
	}

	.btn-link {
		font-size: 14px;
		color: #0070f3;
		text-decoration: none;
		font-weight: 500;
	}

	.main-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-card {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 12px;
		padding: 32px;
	}
	.card-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 24px 0;
		color: #444;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}
	.field:last-child {
		margin-bottom: 0;
	}
	.grid-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	label {
		font-size: 13px;
		font-weight: 600;
		color: #555;
	}

	input,
	textarea,
	select {
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.2s;
	}
	input:focus,
	textarea:focus {
		border-color: #000;
	}

	.slug-input-group {
		display: flex;
		align-items: center;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}
	.slug-input-group:focus-within {
		border-color: #000;
	}
	.url-prefix {
		background: #f9f9f9;
		padding: 0 12px;
		color: #999;
		font-size: 13px;
		border-right: 1px solid #ddd;
		height: 38px;
		display: flex;
		align-items: center;
	}
	.slug-input-group input {
		border: none;
		flex: 1;
	}

	.sticky-actions {
		margin-top: 20px;
		display: flex;
		justify-content: flex-end;
	}

	.btn-save {
		background: #000;
		color: #fff;
		border: none;
		padding: 12px 32px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		font-size: 15px;
	}
	.btn-save:hover {
		opacity: 0.85;
	}

	/* 危险区域 */
	.danger-zone {
		margin-top: 60px;
		padding: 24px;
		border: 1px solid #fee2e2;
		background: #fef2f2;
		border-radius: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.danger-info h3 {
		margin: 0;
		font-size: 16px;
		color: #991b1b;
	}
	.danger-info p {
		margin: 4px 0 0 0;
		font-size: 13px;
		color: #b91c1c;
		opacity: 0.8;
	}
	.btn-delete {
		background: #dc2626;
		color: #fff;
		border: none;
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		font-size: 14px;
	}
	.btn-delete:hover {
		background: #b91c1c;
	}

	.alert {
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
	}
	.alert.success {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #166534;
	}
	.alert.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
	}

	@media (max-width: 600px) {
		.grid-row {
			grid-template-columns: 1fr;
		}
		.danger-zone {
			flex-direction: column;
			gap: 20px;
			text-align: center;
		}
	}
</style>
