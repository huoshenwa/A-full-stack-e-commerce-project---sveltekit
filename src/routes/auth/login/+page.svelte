<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let email = $state('');
	let password = $state('');

	onMount(() => {
		gsap.from('.apple-reveal', {
			opacity: 0,
			y: 15,
			stagger: 0.1,
			duration: 0.8,
			ease: 'power3.out'
		});
	});
</script>

<div class="w-full text-center">
	<header class="apple-reveal mb-14">
		<h1 class="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-3">登录以获取您的设备</h1>
		<p class="text-[#86868b] text-base">管理您的订单及个性化体验</p>
	</header>

	<form class="space-y-6 text-left">
		<div class="apple-reveal">
			<input
				type="email"
				bind:value={email}
				placeholder="电子邮件地址"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] focus:ring-[4px] focus:ring-blue-500/10 transition-all duration-300 outline-none text-[17px]"
			/>
		</div>

		<div class="apple-reveal">
			<input
				type="password"
				bind:value={password}
				placeholder="密码"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] focus:ring-[4px] focus:ring-blue-500/10 transition-all duration-300 outline-none text-[17px]"
			/>
			<div class="mt-3 px-1 flex justify-end">
				<a href="/" class="text-[13px] text-[#0066cc] hover:underline">忘记密码？</a>
			</div>
		</div>

		<div class="apple-reveal pt-4">
			<button
				class="w-full h-[56px] bg-[#0071e3] text-white font-medium rounded-xl hover:bg-[#0077ed] transition-colors active:scale-[0.98] duration-200"
			>
				继续
			</button>
		</div>
	</form>

	<div class="apple-reveal mt-12 mb-10 flex items-center gap-4">
		<div class="h-px flex-1 bg-slate-200"></div>
		<span class="text-[12px] text-[#86868b] font-medium uppercase tracking-wider">其他登录方式</span
		>
		<div class="h-px flex-1 bg-slate-200"></div>
	</div>

	<div class="apple-reveal grid grid-cols-3 gap-3">
		{#each ['Apple', 'WeChat', 'Google'] as brand}
			<button
				class="flex items-center justify-center h-12 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
			>
				<span class="text-sm font-medium text-[#1d1d1f]">{brand}</span>
			</button>
		{/each}
	</div>

	<div class="apple-reveal mt-12 text-[#86868b] text-[15px]">
		还没有 Apple ID？<a href="/auth/register" class="text-[#0066cc] hover:underline ml-1"
			>现在创建</a
		>
	</div>
</div>

<style>
	@reference "../../../app.css";
</style>
