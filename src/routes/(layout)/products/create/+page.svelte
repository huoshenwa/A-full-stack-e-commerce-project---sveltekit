<!-- src/routes/products/create/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let categories = $derived(data.categories);
</script>

<h1>创建商品</h1>

{#if form?.error}
	<p>{form.error}</p>
{/if}

<form method="POST">
	<div>
		<label>
			商品名称*:
			<input type="text" name="name" required />
		</label>
	</div>

	<div>
		<label>
			URL 标识 (slug)*:
			<input type="text" name="slug" required placeholder="如: iphone-15-pro" />
		</label>
	</div>

	<div>
		<label>
			简短描述:
			<input type="text" name="shortDescription" maxlength="500" />
		</label>
	</div>

	<div>
		<label>
			详细描述:
			<textarea name="description" rows="10"></textarea>
		</label>
	</div>

	<div>
		<label>
			价格*:
			<input type="number" name="price" step="0.01" required />
		</label>
	</div>

	<div>
		<label>
			划线价:
			<input type="number" name="compareAtPrice" step="0.01" />
		</label>
	</div>

	<div>
		<label>
			库存*:
			<input type="number" name="stock" required />
		</label>
	</div>

	<div>
		<label>
			SKU:
			<input type="text" name="sku" />
		</label>
	</div>

	<div>
		<label>
			分类:
			<select name="categoryId">
				<option value="">无分类</option>
				{#each categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</label>
	</div>

	<button type="submit">创建商品</button>
</form>
