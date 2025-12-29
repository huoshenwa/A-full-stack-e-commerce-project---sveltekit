<script lang="ts">
	// /admin/products/+page.svelte
	import type { PageData, ActionData } from './$types';
	import { Search, Plus, Edit, Trash2, Filter, Package } from '@lucide/svelte';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let products = $derived(data.products);
	let searchQuery = $state(data.filters.search || '');
</script>

<div class="page-container p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">商品库存</h1>
			<p class="text-sm text-slate-500 mt-1">管理所有在售商品及其库存状态</p>
		</div>
		<a
			href="/admin/products/create"
			class="btn-primary inline-flex items-center gap-2 shadow-sm shadow-indigo-200 w-full sm:w-auto justify-center"
		>
			<Plus class="w-4 h-4" />
			发布商品
		</a>
	</div>

	<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
		<form action="?" method="GET" class="flex flex-col md:flex-row gap-3">
			<div class="relative flex-1">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
				<input
					type="text"
					name="search"
					value={searchQuery}
					placeholder="搜索商品名称、ID..."
					class="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
				/>
			</div>
			<div class="flex gap-3">
				<div class="relative min-w-[120px]">
					<select
						name="status"
						class="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
					>
						<option value="">所有状态</option>
						<option value="draft" selected={data.filters.status === 'draft'}>草稿</option>
						<option value="active" selected={data.filters.status === 'active'}>已发布</option>
					</select>
					<Filter
						class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
					/>
				</div>

				<button
					type="submit"
					class="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm flex-shrink-0"
				>
					筛选
				</button>
			</div>
		</form>
	</div>

	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
		<div class="overflow-x-auto custom-scrollbar">
			<table class="w-full text-left border-collapse min-w-[800px]">
				<thead>
					<tr
						class="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider"
					>
						<th class="px-6 py-4 w-[40%]">商品信息</th>
						<th class="px-6 py-4">价格</th>
						<th class="px-6 py-4">库存</th>
						<th class="px-6 py-4">状态</th>
						<th class="px-6 py-4">销量</th>
						<th class="px-6 py-4 text-right">操作</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each products as product (product.id)}
						<tr class="group hover:bg-slate-50/80 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div
										class="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200"
									>
										{#if product.image}
											<img src={product.image} alt="" class="w-full h-full object-cover" />
										{:else}
											<div class="w-full h-full flex items-center justify-center text-slate-300">
												<Package class="w-5 h-5" />
											</div>
										{/if}
									</div>
									<div class="min-w-0">
										<div
											class="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]"
										>
											{product.name}
										</div>
										<div class="text-xs text-slate-500 font-mono mt-0.5">
											ID: {product.id.slice(0, 8)}
										</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="font-semibold text-slate-900 tabular-nums">¥{product.price}</span>
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {product.stock <
									10
										? 'bg-red-50 text-red-700 border-red-100'
										: 'bg-green-50 text-green-700 border-green-100'}"
								>
									{product.stock}
								</span>
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {product.isPublished
										? 'bg-indigo-50 text-indigo-700 border-indigo-100'
										: 'bg-slate-100 text-slate-600 border-slate-200'}"
								>
									{product.isPublished ? '已发布' : '草稿'}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600 tabular-nums">
								{product.salesCount}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
										title="编辑"
									>
										<Edit class="w-4 h-4" />
									</button>
									<button
										class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										title="删除"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if products.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-16 text-center text-slate-500">
								<div class="flex flex-col items-center">
									<Package class="w-10 h-10 text-slate-300 mb-2" />
									<span>暂无商品数据</span>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		{#if data.pagination && data.pagination.totalPages > 1}
			<div
				class="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4"
			>
				<span class="text-sm text-slate-500">
					第 {data.pagination.page} / {data.pagination.totalPages} 页
				</span>
				<div class="flex gap-2">
					<a
						href="?page={Math.max(1, data.pagination.page - 1)}&search={data.filters
							.search}&status={data.filters.status}"
						class="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 {data
							.pagination.page <= 1
							? 'pointer-events-none opacity-50'
							: ''}"
					>
						上一页
					</a>
					<a
						href="?page={Math.min(
							data.pagination.totalPages,
							data.pagination.page + 1
						)}&search={data.filters.search}&status={data.filters.status}"
						class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors {data
							.pagination.page >= data.pagination.totalPages
							? 'pointer-events-none opacity-50'
							: ''}"
					>
						下一页
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@reference '../../layout.css';
	.btn-primary {
		@apply rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-95;
	}

	/* 横向滚动条美化 */
	.custom-scrollbar::-webkit-scrollbar {
		height: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #94a3b8;
	}
</style>
