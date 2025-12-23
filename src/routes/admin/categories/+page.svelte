<!-- src/routes/admin/categories/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let categories = $derived(data.categories);

	// 递归渲染分类树
	function renderCategory(category: any, level: number = 0) {
		return { category, level };
	}

	function flattenCategories(cats: any[], level: number = 0): any[] {
		let result: any[] = [];
		for (const cat of cats) {
			result.push({ ...cat, level });
			if (cat.children && cat.children.length > 0) {
				result = result.concat(flattenCategories(cat.children, level + 1));
			}
		}
		return result;
	}

	let flatCategories = $derived(flattenCategories(categories));
</script>

<h1>分类管理</h1>

{#if form?.error}
	<p>{form.error}</p>
{/if}

{#if form?.success}
	<p>操作成功！</p>
{/if}

<h2>创建新分类</h2>
<form method="POST" action="?/create" use:enhance>
	<div>
		<label>
			名称:
			<input type="text" name="name" required />
		</label>
	</div>

	<div>
		<label>
			标识 (slug):
			<input type="text" name="slug" required />
		</label>
	</div>

	<div>
		<label>
			描述:
			<input type="text" name="description" />
		</label>
	</div>

	<div>
		<label>
			父分类:
			<select name="parentId">
				<option value="">无（顶级分类）</option>
				{#each flatCategories as cat}
					<option value={cat.id}>
						{'—'.repeat(cat.level)}
						{cat.name}
					</option>
				{/each}
			</select>
		</label>
	</div>

	<div>
		<label>
			排序:
			<input type="number" name="sortOrder" value="0" />
		</label>
	</div>

	<button type="submit">创建</button>
</form>

<hr />

<h2>现有分类</h2>
<table>
	<thead>
		<tr>
			<th>名称</th>
			<th>标识</th>
			<th>排序</th>
			<th>操作</th>
		</tr>
	</thead>
	<tbody>
		{#each flatCategories as cat (cat.id)}
			<tr>
				<td>
					{'—'.repeat(cat.level)}
					{cat.name}
				</td>
				<td>{cat.slug}</td>
				<td>{cat.sortOrder}</td>
				<td>
					<form method="POST" action="?/delete" use:enhance style="display:inline;">
						<input type="hidden" name="categoryId" value={cat.id} />
						<button type="submit" onclick="return confirm('确定删除？')">删除</button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
