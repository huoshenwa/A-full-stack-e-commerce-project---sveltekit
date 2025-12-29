<script lang="ts">
	// /admin/categories/+page.svelte
	import type { PageData, ActionData } from './$types';
	import { FolderTree, Plus, Trash2, Edit, X } from '@lucide/svelte';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isFormOpen = $state(false);
</script>

<div class="page-container p-4 md:p-8 max-w-6xl mx-auto w-full pb-24">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">分类管理</h1>
			<p class="text-sm text-slate-500 mt-1">管理商品的层级分类结构</p>
		</div>
		<button
			onclick={() => (isFormOpen = true)}
			class="btn-primary w-full sm:w-auto shadow-sm shadow-indigo-200"
		>
			<Plus class="w-4 h-4" /> 新建分类
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
		<div class="lg:col-span-2 space-y-3">
			{#each data.categories as category}
				<div
					class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 hover:shadow-md transition-all duration-200"
				>
					<div class="flex items-center gap-4 min-w-0">
						<div
							class="w-10 h-10 flex-shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"
						>
							<FolderTree class="w-5 h-5" />
						</div>
						<div class="min-w-0 truncate">
							<h3 class="font-bold text-slate-800 truncate">{category.name}</h3>
							<div class="flex flex-wrap items-center gap-2 mt-0.5">
								<span
									class="text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate max-w-[150px]"
									>/{category.slug}</span
								>
								{#if category.parentId}
									<span
										class="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 font-medium"
										>子分类</span
									>
								{/if}
							</div>
						</div>
					</div>

					<div
						class="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<button
							class="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
							title="编辑"
						>
							<Edit class="w-4 h-4" />
						</button>
						<form method="POST" class="inline">
							<input type="hidden" name="categoryId" value={category.id} />
							<button
								type="submit"
								class="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
								title="删除"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</form>
					</div>
				</div>
			{/each}

			{#if data.categories.length === 0}
				<div
					class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300"
				>
					<FolderTree class="w-12 h-12 text-slate-300 mb-3" />
					<p class="text-slate-500 text-sm">暂无分类数据</p>
				</div>
			{/if}
		</div>

		{#if isFormOpen}
			<div
				class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
				onclick={() => (isFormOpen = false)}
				role="presentation"
			></div>

			<div
				class="
                fixed inset-x-0 bottom-0 top-auto z-50 p-4
                lg:static lg:z-auto lg:p-0 lg:col-span-1 lg:block
            "
			>
				<div
					class="
                    bg-white rounded-t-2xl shadow-2xl lg:shadow-lg lg:rounded-xl border border-slate-200
                    p-6 lg:sticky lg:top-6 max-h-[85vh] lg:max-h-[calc(100vh-4rem)] overflow-y-auto
                "
				>
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-bold text-slate-900">新建分类</h3>
						<button
							onclick={() => (isFormOpen = false)}
							class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
						>
							<X class="w-5 h-5" />
						</button>
					</div>

					{#if form?.error}
						<div
							class="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2"
						>
							<span>⚠️</span>
							<span>{form.error}</span>
						</div>
					{/if}

					<form method="POST" action="?/create" class="space-y-4">
						<div class="space-y-1">
							<label class="block text-sm font-semibold text-slate-700">分类名称</label>
							<input
								type="text"
								name="name"
								required
								class="input-field"
								placeholder="例如：电子产品"
							/>
						</div>
						<div class="space-y-1">
							<label class="block text-sm font-semibold text-slate-700">标识 Slug</label>
							<input
								type="text"
								name="slug"
								required
								class="input-field"
								placeholder="例如：electronics"
							/>
						</div>
						<div class="space-y-1">
							<label class="block text-sm font-semibold text-slate-700">上级分类</label>
							<div class="relative">
								<select name="parentId" class="input-field appearance-none">
									<option value="">无 (顶级分类)</option>
									{#each data.categories as cat}
										<option value={cat.id}>{cat.name}</option>
									{/each}
								</select>
								<div
									class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										></path></svg
									>
								</div>
							</div>
						</div>
						<div class="space-y-1">
							<label class="block text-sm font-semibold text-slate-700">排序权重</label>
							<input type="number" name="sortOrder" value="0" class="input-field" />
						</div>
						<div class="space-y-1">
							<label class="block text-sm font-semibold text-slate-700">描述</label>
							<textarea name="description" rows="3" class="input-field resize-none"></textarea>
						</div>
						<div class="pt-2">
							<button type="submit" class="w-full btn-primary py-2.5 justify-center">
								保存分类
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@reference '../../layout.css';
	.btn-primary {
		@apply flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95;
	}
	.input-field {
		@apply w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20;
	}
</style>
