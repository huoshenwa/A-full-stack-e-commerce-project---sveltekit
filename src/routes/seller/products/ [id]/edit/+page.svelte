<!-- src/routes/seller/products/[id]/edit/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let product = $derived(data.product);
	let categories = $derived(data.categories);
</script>

<h1>编辑商品: {product.name}</h1>

{#if form?.error}
	<p>{form.error}</p>
{/if}

{#if form?.success}
	<p>更新成功！</p>
{/if}

<form method="POST" action="?/update" use:enhance>
	<div>
		<label>
			商品名称:
			<input type="text" name="name" value={product.name} required />
		</label>
	</div>

	<div>
		<label>
			URL 标识:
			<input type="text" name="slug" value={product.slug} required />
		</label>
	</div>

	<div>
		<label>
			简短描述:
			<input type="text" name="shortDescription" value={product.shortDescription || ''} />
		</label>
	</div>

	<div>
		<label>
			详细描述:
			<textarea name="description" rows="10">{product.description || ''}</textarea>
		</label>
	</div>

	<div>
		<label>
			价格:
			<input type="number" name="price" step="0.01" value={product.price} required />
		</label>
	</div>

	<div>
		<label>
			划线价:
			<input type="number" name="compareAtPrice" step="0.01" value={product.compareAtPrice || ''} />
		</label>
	</div>

	<div>
		<label>
			库存:
			<input type="number" name="stock" value={product.stock} required />
		</label>
	</div>

	<div>
		<label>
			SKU:
			<input type="text" name="sku" value={product.sku || ''} />
		</label>
	</div>

	<div>
		<label>
			分类:
			<select name="categoryId">
				<option value="">无分类</option>
				{#each categories as category}
					<option value={category.id} selected={category.id === product.categoryId}>
						{category.name}
					</option>
				{/each}
			</select>
		</label>
	</div>

	<button type="submit">保存更新</button>
</form>

<hr />

<form method="POST" action="?/delete" use:enhance>
	<button type="submit" onclick="return confirm('确定删除此商品？')">删除商品</button>
</form>

<a href="/seller">返回商家中心</a>
