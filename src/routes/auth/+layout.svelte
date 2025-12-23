<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let { children } = $props();
	let mainContainer = $state<HTMLElement>();

	// onMount(() => {
	// 	// 苹果式的优雅淡入：略微上移并平滑显现
	// 	gsap.from(mainContainer, {
	// 		y: 10,
	// 		opacity: 0,
	// 		duration: 1.2,
	// 		ease: 'power2.out'
	// 	});
	// });
</script>

<div
	class="auth-wrapper min-h-screen w-full flex items-center justify-center bg-[#f5f5f7] selection:bg-blue-500/30"
>
	<div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
		<div
			class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-white to-transparent blur-3xl opacity-50"
		></div>
		<div
			class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-slate-200 to-transparent blur-3xl opacity-30"
		></div>
	</div>

	<main
		bind:this={mainContainer}
		class="relative z-10 w-full max-w-[480px] px-8 py-16 md:px-12 bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
	>
		<div class="flex justify-center mb-10">
			<div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
				<div class="w-4 h-4 border-2 border-white rounded-full"></div>
			</div>
		</div>

		{@render children()}
	</main>
</div>

<style>
	@reference "../../app.css";

	:global(body) {
		@apply bg-[#f5f5f7] text-[#1d1d1f] antialiased;
		/* 苹果官网专用字体序列 */
		font-family: 'SF Pro Display', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}
</style>
