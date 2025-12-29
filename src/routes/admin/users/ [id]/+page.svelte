<script lang="ts">
	import type { PageData } from './$types';
	import { User, Mail, MapPin, ShoppingBag, Shield, Ban } from '@lucide/svelte';
	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);
</script>

<div class="page-container p-6 md:p-8 max-w-5xl mx-auto w-full">
	<div class="mb-6">
		<a
			href="/admin/users"
			class="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1"
		>
			← 返回用户列表
		</a>
	</div>
	<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
		<!-- Header -->
		<div
			class="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/50"
		>
			<div class="flex items-center gap-6">
				<div
					class="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold shadow-inner"
				>
					{user.username?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div>
					<h1 class="text-2xl font-bold text-slate-900">{user.username}</h1>
					<p class="text-slate-500 mt-1 flex items-center gap-2">
						<Mail class="w-4 h-4" />
						{user.email}
					</p>
				</div>
			</div>
			<div class="flex gap-3">
				<button
					class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
				>
					编辑资料
				</button>
				{#if user.isActive}
					<button
						class="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
					>
						<Ban class="w-4 h-4" /> 禁用账号
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
					>
						启用账号
					</button>
				{/if}
			</div>
		</div>
		<!-- Body -->
		<div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Info Column -->
			<div class="md:col-span-2 space-y-8">
				<section>
					<h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">基本信息</h3>
					<div class="grid grid-cols-2 gap-6">
						<div>
							<label class="block text-xs text-slate-500 mb-1">用户 ID</label>
							<div
								class="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block"
							>
								{user.id}
							</div>
						</div>
						<div>
							<label class="block text-xs text-slate-500 mb-1">注册时间</label>
							<div class="text-sm text-slate-700">
								{new Date(user.createdAt).toLocaleDateString()}
							</div>
						</div>
						<div>
							<label class="block text-xs text-slate-500 mb-1">角色</label>
							<div class="text-sm text-slate-700 capitalize">{user.role || 'User'}</div>
						</div>
						<div>
							<label class="block text-xs text-slate-500 mb-1">状态</label>
							<span
								class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium {user.isActive
									? 'bg-green-100 text-green-700'
									: 'bg-red-100 text-red-700'}"
							>
								{user.isActive ? '正常' : '已禁用'}
							</span>
						</div>
					</div>
				</section>
				<section>
					<h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">收货地址</h3>
					{#if user.addresses && user.addresses.length > 0}
						<div class="space-y-3">
							{#each user.addresses as addr}
								<div class="p-4 border border-slate-200 rounded-lg flex gap-4">
									<div class="mt-1 text-slate-400">
										<MapPin class="w-5 h-5" />
									</div>
									<div>
										<div class="text-sm font-medium text-slate-900">
											{addr.receiverName}
											<span class="text-slate-500 font-normal ml-2">{addr.receiverPhone}</span>
										</div>
										<div class="text-sm text-slate-600 mt-1">
											{addr.province}
											{addr.city}
											{addr.district}
											{addr.detailAddress}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-slate-500">未添加收货地址</p>
					{/if}
				</section>
			</div>
			<!-- Stats Column -->
			<div class="md:col-span-1">
				<div class="bg-slate-50 rounded-xl p-6 border border-slate-100">
					<h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">用户数据</h3>
					<div class="space-y-6">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
									<ShoppingBag class="w-5 h-5" />
								</div>
								<span class="text-sm text-slate-600">订单总数</span>
							</div>
							<span class="text-xl font-bold text-slate-900">{data.orderCount}</span>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-green-100 text-green-600 rounded-lg">
									<Shield class="w-5 h-5" />
								</div>
								<span class="text-sm text-slate-600">账户信誉</span>
							</div>
							<span class="text-xl font-bold text-slate-900">正常</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
