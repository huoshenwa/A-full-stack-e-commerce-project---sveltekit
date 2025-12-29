<script lang="ts">
	// /admin/+layout.svelte
	import { page } from '$app/stores';
	import { Package, Layers, Users, Settings, LogOut, ChevronRight, Menu } from '@lucide/svelte';
	let { data, children } = $props();

	// 简单的移动端菜单状态（仅用于演示样式布局，不改变核心逻辑）
	let isMobileMenuOpen = $state(false);

	const menuItems = [
		{
			group: '管理',
			items: [
				{ label: '商品管理', href: '/admin/products', icon: Package },
				{ label: '分类管理', href: '/admin/categories', icon: Layers },
				{ label: '用户列表', href: '/admin/users', icon: Users }
			]
		},
		{
			group: '系统',
			items: [
				{ label: '站点设置', href: '/admin/settings', icon: Settings },
				{ label: '退出登录', href: '/auth/logout', icon: LogOut }
			]
		}
	];
</script>

<div class="admin-layout h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
	<header
		class="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-30 flex items-center justify-between px-4 shadow-md"
	>
		<div class="flex items-center gap-2 text-white font-bold">
			<div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">A</div>
			<span>管理面板</span>
		</div>
		<button class="text-white p-2">
			<Menu class="w-6 h-6" />
		</button>
	</header>

	<aside
		class="sidebar w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col h-full z-40 transition-all duration-300 border-r border-slate-800"
	>
		<div class="p-6 border-b border-slate-800 h-16 flex items-center">
			<h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
				<div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">A</div>
				管理面板
			</h1>
		</div>

		<nav
			class="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700"
		>
			{#each menuItems as section}
				<div>
					<p class="px-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
						{section.group}
					</p>
					<div class="space-y-1">
						{#each section.items as item}
							<a
								href={item.href}
								class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white group"
								class:active={$page.url.pathname === item.href}
							>
								<svelte:component this={item.icon} class="w-4 h-4" />
								{item.label}
								{#if $page.url.pathname === item.href}
									<ChevronRight class="ml-auto w-4 h-4 text-indigo-400" />
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</nav>

		<div class="p-4 border-t border-slate-800 bg-slate-900/50">
			<div class="flex items-center gap-3 px-2">
				<div
					class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold ring-2 ring-slate-800"
				>
					{data.user?.displayName?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div class="flex flex-col min-w-0">
					<span class="text-sm text-white font-medium truncate">{data.user?.displayName}</span>
					<span class="text-xs text-slate-500">管理员</span>
				</div>
			</div>
		</div>
	</aside>

	<main
		class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto scroll-smooth bg-slate-50 relative pt-16 md:pt-0"
	>
		{@render children()}
	</main>
</div>

<style>
	@reference '../layout.css';

	.admin-layout {
		@apply antialiased;
	}
	.nav-item.active {
		@apply bg-indigo-600/10 text-indigo-400;
	}

	/* 自定义滚动条样式 */
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background-color: #334155;
		border-radius: 20px;
	}
</style>
