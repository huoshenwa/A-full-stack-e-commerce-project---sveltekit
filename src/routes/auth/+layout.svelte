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

<div class="app-wrapper">
	<nav class="nav-container"></nav>

	<main class="content-area">
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		--primary: #000000;
		--accent: #0070f3;
		--bg-subtle: #fafafa;
		--border-radius: 12px;
		--transition: all 0.2s ease;
	}

	:global(body) {
		margin: 0;
		font-family: 'Inter', system-ui, sans-serif;
		/* 极简主义商业背景：微弱的径向渐变 */
		background: radial-gradient(circle at top right, #ffffff, #f4f4f4);
		min-height: 100vh;
		color: #1a1a1a;
	}

	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
