<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	onMount(() => {
		gsap.from('.apple-reveal-reg', {
			opacity: 0,
			x: -10,
			stagger: 0.08,
			duration: 0.8,
			ease: 'power2.out'
		});
	});
</script>

<div class="w-full">
	<header class="apple-reveal-reg mb-12 text-center">
		<h1 class="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-3">创建 Apple ID</h1>
		<p class="text-[#86868b] text-base">一个账户，通行所有 Apple 服务</p>
	</header>

	<form class="space-y-6">
		<div class="apple-reveal-reg grid grid-cols-2 gap-4">
			<input
				type="text"
				placeholder="姓氏"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] outline-none transition-all"
			/>
			<input
				type="text"
				placeholder="名字"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] outline-none transition-all"
			/>
		</div>

		<div class="apple-reveal-reg">
			<input
				type="email"
				placeholder="name@example.com"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] outline-none transition-all"
			/>
		</div>

		<div class="apple-reveal-reg space-y-4">
			<input
				type="password"
				placeholder="密码"
				class="w-full h-[56px] px-4 rounded-xl bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#0066cc] outline-none transition-all"
			/>
			<p class="px-1 text-[12px] text-[#86868b] leading-relaxed">
				密码必须包含至少 8 个字符，且包含大、小写字母及至少一个数字。
			</p>
		</div>

		<div class="apple-reveal-reg pt-6 pb-2 border-t border-slate-100">
			<label class="flex items-start gap-3 cursor-pointer group">
				<input
					type="checkbox"
					class="mt-1 w-4 h-4 rounded-full border-slate-300 text-[#0066cc] focus:ring-0"
				/>
				<span class="text-[13px] text-[#86868b] leading-snug">
					通过公告、软件更新、Apple 产品和服务信息了解最新资讯。
				</span>
			</label>
		</div>

		<button
			class="apple-reveal-reg w-full h-[56px] bg-[#0071e3] text-white font-medium rounded-xl hover:bg-[#0077ed] transition-all"
		>
			继续
		</button>
	</form>

	<div class="apple-reveal-reg mt-10 text-center">
		<a href="/auth/login" class="text-[15px] text-[#0066cc] hover:underline">返回登录页面</a>
	</div>
</div>

<style>
	@reference "../../../app.css";
</style>
