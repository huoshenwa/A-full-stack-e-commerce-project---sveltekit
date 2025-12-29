<script lang="ts">
	import { ShoppingCart, FileText, MapPin, X, Menu } from '@lucide/svelte';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
	// 移动端菜单状态管理
	let isMobileMenuOpen = $state(false);
</script>

<svelte:window
	on:resize={() => {
		if (window.innerWidth >= 768) isMobileMenuOpen = false;
	}}
/>
<nav class="nav-wrapper">
	<div class="nav-content">
		<div class="brand">
			<a href="/products" class="logo">ELECTRO<span class="dot">.</span></a>
		</div>
		<!-- 桌面端导航链接 -->
		<div class="links desktop-only">
			<a href="/products" class="nav-link">所有商品</a>
			{#if user?.permissions.includes('product.write')}
				<a href="/seller" class="nav-link">商家中心</a>
			{/if}
			{#if user?.permissions.includes('product.manage')}
				<a href="/admin/products" class="nav-link">管理中心</a>
			{/if}
		</div>
		<!-- 右侧操作区 -->
		<div class="auth desktop-only">
			{#if user}
				<div class="user-menu-wrapper">
					<a href="/account/profile" class="nav-link flex items-center gap-2">
						<span class="welcome">Hi, {user.displayName || user.email}</span>
					</a>
					<form method="POST" action="/auth/logout">
						<button type="submit" class="btn-text">登出</button>
					</form>
				</div>
				<!-- 购物车与订单图标 -->
				<div class="action-icons">
					<a href="/cart" class="icon-link" aria-label="购物车">
						<ShoppingCart size={20} />
					</a>
					<a href="/orders" class="icon-link" aria-label="我的订单">
						<FileText size={20} />
					</a>
					<a href="/profile/addresses" class="icon-link" aria-label="我的地址">
						<MapPin size={20} />
					</a>
				</div>
			{:else}
				<a href="/auth/login" class="nav-link">登录</a>
				<a href="/auth/register" class="btn-primary">开启探索</a>
			{/if}
		</div>
		<!-- 移动端菜单按钮 -->
		<button
			class="mobile-menu-btn mobile-only"
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			aria-label="菜单"
		>
			{#if isMobileMenuOpen}
				<X size={24} />
			{:else}
				<Menu size={24} />
			{/if}
		</button>
	</div>
	<!-- 移动端下拉菜单 -->
	{#if isMobileMenuOpen}
		<div class="mobile-menu mobile-only">
			<div class="mobile-links">
				<a href="/products" class="mobile-link">所有商品</a>
				{#if user?.permissions.includes('product.write')}
					<a href="/seller" class="mobile-link">商家中心</a>
				{/if}
				{#if user?.permissions.includes('product.manage')}
					<a href="/admin/products" class="mobile-link">管理中心</a>
				{/if}
				{#if user}
					<hr class="mobile-divider" />
					<a href="/profile" class="mobile-link">个人中心</a>
					<a href="/cart" class="mobile-link">购物车</a>
					<a href="/orders" class="mobile-link">我的订单</a>
					<a href="/profile/addresses" class="mobile-link">我的地址</a>
					<form method="POST" action="/auth/logout" class="mobile-logout-form">
						<button type="submit" class="mobile-link w-full text-left text-red-400"> 登出 </button>
					</form>
				{:else}
					<hr class="mobile-divider" />
					<a href="/auth/login" class="mobile-link">登录</a>
					<a href="/auth/register" class="mobile-link btn-primary-mobile">注册</a>
				{/if}
			</div>
		</div>
	{/if}
</nav>
<main class="container">
	{@render children()}
</main>

<style type="text/tailwindcss">
	@reference '../layout.css';
	/* 导航栏容器 */
	.nav-wrapper {
		@apply sticky top-0 z-50 flex h-[70px] items-center border-b border-neutral-800 bg-black/60 backdrop-blur-xl;
	}
	.nav-content {
		@apply mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-4 lg:px-8;
	}
	/* Logo 设计 */
	.logo {
		@apply font-mono text-xl font-extrabold tracking-widest text-white no-underline transition-opacity hover:opacity-80;
	}
	.dot {
		@apply text-blue-500;
	}
	/* 桌面端链接 */
	.links {
		@apply flex items-center gap-8;
	}
	.nav-link {
		@apply text-sm font-medium text-neutral-400 no-underline transition-colors hover:text-white;
	}
	/* 右侧用户区 */
	.auth {
		@apply flex items-center gap-6;
	}
	.user-menu-wrapper {
		@apply flex items-center gap-4;
	}
	.welcome {
		@apply text-sm text-neutral-500;
	}
	.btn-text {
		@apply cursor-pointer border-none bg-transparent p-0 text-sm text-neutral-500 transition-colors hover:text-white;
	}
	/* 主按钮 */
	.btn-primary {
		@apply rounded-md bg-white px-5 py-2.5 text-sm font-bold text-black no-underline transition-all hover:bg-neutral-200 active:scale-95;
	}
	/* 图标区域 */
	.action-icons {
		@apply flex items-center gap-4 border-l border-neutral-800 pl-6;
	}
	/* 图标链接样式 - 修复了 group 报错，使用原生伪类 */
	.icon-link {
		@apply relative text-slate-400 transition-colors duration-200;
	}
	.icon-link:hover {
		@apply text-cyan-400;
	}
	/* 下划线动画效果 */
	.icon-link::after {
		content: '';
		@apply absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-cyan-500 transition-all duration-300;
	}
	.icon-link:hover::after {
		width: 100%;
		bottom: -2px;
	}
	/* 内容容器 */
	.container {
		@apply mx-auto min-h-[calc(100vh-70px)] max-w-[1400px] p-6 lg:p-8;
	}
	/* 响应式控制类 */
	.desktop-only {
		@apply hidden md:flex;
	}
	.mobile-only {
		@apply flex md:hidden;
	}
	/* 移动端菜单按钮 */
	.mobile-menu-btn {
		@apply text-neutral-400 transition-colors hover:text-white;
	}
	/* 移动端下拉菜单 */
	.mobile-menu {
		@apply absolute top-[70px] left-0 w-full border-b border-neutral-800 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-xl;
		animation: slideDown 0.2s ease-out;
	}
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.mobile-links {
		@apply flex flex-col gap-1;
	}
	.mobile-link {
		@apply block w-full rounded-lg px-4 py-3 text-left text-neutral-300 no-underline transition-colors hover:bg-neutral-800/50 hover:text-white;
	}
	.mobile-divider {
		@apply my-2 border-neutral-800;
	}
	.btn-primary-mobile {
		@apply mt-2 bg-white text-center font-bold text-black;
	}
	.mobile-logout-form {
		@apply w-full;
	}
</style>
