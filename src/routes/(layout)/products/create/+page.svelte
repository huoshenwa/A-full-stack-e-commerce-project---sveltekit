<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let categories = $derived(data.categories);
</script>

<div class="form-container">
	<header class="form-header">
		<h1>发布新商品</h1>
		<p>填写以下信息以将新商品添加到您的店铺</p>
	</header>

	{#if form?.error}
		<div class="error-banner">
			<span class="icon">!</span>
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="main-form">
		<section class="form-section">
			<h2 class="section-title">基本信息</h2>

			<div class="field">
				<label for="name">商品名称 <span class="required">*</span></label>
				<input type="text" id="name" name="name" required placeholder="例如：iPhone 15 Pro" />
			</div>

			<div class="field">
				<label for="slug">URL 标识 (Slug) <span class="required">*</span></label>
				<div class="input-wrapper">
					<span class="prefix">myshop.com/products/</span>
					<input type="text" id="slug" name="slug" required placeholder="iphone-15-pro" />
				</div>
			</div>

			<div class="field">
				<label for="shortDescription">简短描述</label>
				<input
					type="text"
					id="shortDescription"
					name="shortDescription"
					maxlength="500"
					placeholder="一句话概括商品卖点"
				/>
			</div>

			<div class="field">
				<label for="description">详细描述</label>
				<textarea id="description" name="description" rows="6" placeholder="输入商品的详细介绍..."
				></textarea>
			</div>
		</section>

		<section class="form-section">
			<h2 class="section-title">定价与库存</h2>

			<div class="grid-fields">
				<div class="field">
					<label for="price">销售价格 <span class="required">*</span></label>
					<div class="input-wrapper">
						<span class="prefix">¥</span>
						<input type="number" id="price" name="price" step="0.01" required placeholder="0.00" />
					</div>
				</div>

				<div class="field">
					<label for="compareAtPrice">划线价 (原价)</label>
					<div class="input-wrapper">
						<span class="prefix">¥</span>
						<input
							type="number"
							id="compareAtPrice"
							name="compareAtPrice"
							step="0.01"
							placeholder="0.00"
						/>
					</div>
				</div>
			</div>

			<div class="grid-fields">
				<div class="field">
					<label for="stock">库存数量 <span class="required">*</span></label>
					<input type="number" id="stock" name="stock" required placeholder="0" />
				</div>

				<div class="field">
					<label for="sku">SKU 编码</label>
					<input type="text" id="sku" name="sku" placeholder="例如：APL-I15P-BLK" />
				</div>
			</div>
		</section>

		<section class="form-section">
			<h2 class="section-title">分类</h2>
			<div class="field">
				<label for="categoryId">选择所属分类</label>
				<select id="categoryId" name="categoryId">
					<option value="">未分类</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>
		</section>

		<footer class="form-footer">
			<button type="button" class="btn-secondary" onclick={() => history.back()}>取消</button>
			<button type="submit" class="btn-primary">确认发布商品</button>
		</footer>
	</form>
</div>

<style>
	.form-container {
		max-width: 720px;
		margin: 40px auto;
		padding: 0 20px;
		color: #111;
	}

	.form-header {
		margin-bottom: 32px;
	}

	.form-header h1 {
		font-size: 24px;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.form-header p {
		color: #666;
		font-size: 14px;
	}

	.main-form {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.form-section {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 12px;
		padding: 24px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 20px 0;
		padding-bottom: 12px;
		border-bottom: 1px solid #f5f5f5;
	}

	.field {
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	label {
		font-size: 13px;
		font-weight: 500;
		color: #444;
	}

	.required {
		color: #ff4d4f;
	}

	/* 输入框通用样式 */
	input[type='text'],
	input[type='number'],
	textarea,
	select {
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.2s;
		background: #fff;
	}

	input:focus,
	textarea:focus,
	select:focus {
		border-color: #000;
	}

	/* 带前缀的输入框 */
	.input-wrapper {
		display: flex;
		align-items: center;
		border: 1px solid #ddd;
		border-radius: 6px;
		overflow: hidden;
		background: #fff;
	}

	.input-wrapper:focus-within {
		border-color: #000;
	}

	.prefix {
		background: #f8f8f8;
		padding: 0 12px;
		color: #888;
		font-size: 13px;
		border-right: 1px solid #ddd;
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	.input-wrapper input {
		border: none !important;
		flex: 1;
	}

	/* 网格布局 */
	.grid-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	/* 按钮 */
	.form-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.btn-primary {
		background: #000;
		color: #fff;
		border: none;
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary {
		background: #fff;
		color: #666;
		border: 1px solid #ddd;
		padding: 12px 24px;
		border-radius: 6px;
		cursor: pointer;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}
	.btn-secondary:hover {
		background: #f9f9f9;
	}

	/* 错误 banner */
	.error-banner {
		background: #fff2f0;
		border: 1px solid #ffccc7;
		color: #ff4d4f;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	@media (max-width: 600px) {
		.grid-fields {
			grid-template-columns: 1fr;
		}
	}
</style>
