<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let flatCategories = $derived.by(() => {
		function flatten(cats: any[], level = 0): any[] {
			let res: any[] = [];
			for (const cat of cats) {
				res.push({ ...cat, level });
				if (cat.children) res = res.concat(flatten(cat.children, level + 1));
			}
			return res;
		}
		return flatten(data.categories);
	});
</script>

<div class="admin-wrapper">
	<header class="page-header">
		<h1>分类管理</h1>
	</header>

	{#if form?.error}<p class="msg-error">{form.error}</p>{/if}
	{#if form?.success}<p class="msg-success">操作成功</p>{/if}

	<section class="panel">
		<h2 class="section-title">新增分类</h2>
		<form method="POST" action="?/create" use:enhance class="compact-form">
			<input type="text" name="name" placeholder="分类名称" required />
			<input type="text" name="slug" placeholder="唯一标识 (Slug)" required />
			<select name="parentId">
				<option value="">顶级分类</option>
				{#each flatCategories as cat}
					<option value={cat.id}>{'　'.repeat(cat.level)} {cat.name}</option>
				{/each}
			</select>
			<input type="number" name="sortOrder" placeholder="排序" style="width: 80px" />
			<button type="submit" class="btn-main">创建</button>
		</form>
	</section>

	<section class="panel">
		<table class="simple-table">
			<thead>
				<tr>
					<th>名称</th>
					<th>标识</th>
					<th>排序值</th>
					<th style="text-align: right">操作</th>
				</tr>
			</thead>
			<tbody>
				{#each flatCategories as cat (cat.id)}
					<tr>
						<td style="padding-left: {cat.level * 24 + 12}px">
							{#if cat.level > 0}<span class="tree-line">└</span>{/if}
							<span class="name-text">{cat.name}</span>
						</td>
						<td class="slug-text">{cat.slug}</td>
						<td>{cat.sortOrder}</td>
						<td style="text-align: right">
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="categoryId" value={cat.id} />
								<button class="btn-delete" onclick={() => confirm('删除此分类？')}>删除</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</div>

<style>
	.admin-wrapper {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		color: #111;
	}
	.page-header h1 {
		font-size: 24px;
		font-weight: 600;
		margin-bottom: 30px;
	}
	.panel {
		background: #fff;
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 24px;
	}
	.section-title {
		font-size: 14px;
		color: #666;
		margin: 0 0 16px 0;
	}

	/* 表单样式 */
	.compact-form {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	input,
	select {
		border: 1px solid #ddd;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 14px;
		outline: none;
	}
	input:focus {
		border-color: #000;
	}
	.btn-main {
		background: #111;
		color: #fff;
		border: none;
		padding: 8px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	/* 表格样式 */
	.simple-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.simple-table th {
		text-align: left;
		padding: 12px;
		border-bottom: 2px solid #f5f5f5;
		color: #888;
		font-weight: 500;
	}
	.simple-table td {
		padding: 12px;
		border-bottom: 1px solid #f5f5f5;
	}

	.name-text {
		font-weight: 500;
	}
	.slug-text {
		font-family: monospace;
		color: #666;
		background: #f8f8f8;
		padding: 2px 6px;
		border-radius: 3px;
	}
	.tree-line {
		color: #ccc;
		margin-right: 8px;
	}
	.btn-delete {
		color: #ff4d4f;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 13px;
	}

	.msg-error {
		color: #ff4d4f;
		background: #fff2f0;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 15px;
	}
	.msg-success {
		color: #52c41a;
		background: #f6ffed;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 15px;
	}
</style>
