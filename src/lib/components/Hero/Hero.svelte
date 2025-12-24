<script lang="ts">
	import { showBuy, showTitle } from './motion';
	import './hero.css';
	import { onMount } from 'svelte';
	import heroSrc from '../../assets/videos/hero.mp4';
	import smallHeroSrc from '../../assets/videos/smallHero.mp4';
	import { browser } from '$app/environment';
	// 判断当前是否 >= md
	let isMdUp: boolean | null = $state(null);
	//根据屏幕大小的断点派生videoSrc
	let videoSrc = $derived(isMdUp ? heroSrc : smallHeroSrc);
	$effect(() => {
		if (!browser) return;
		// 步骤 1：创建媒体查询检测器（window.matchMedia）
		// 返回一个 MediaQueryList 类型的对象,具有matches属性(屏幕宽 800px → true，600px → false）
		const mq = window.matchMedia('(min-width: 658px)');

		// 步骤 2： 获取检测器的「初始状态」，并赋值给变量 isMdUp(true/false)
		isMdUp = mq.matches;

		const handler = (e: MediaQueryListEvent) => {
			isMdUp = e.matches;
		};
		// 只有 “跨越阈值” 时，才会向 JS 线程派发 change 事件；
		mq.addEventListener('change', handler);
		// cleanup（等价 onDestroy）
		return () => {
			mq.removeEventListener('change', handler);
		};
	});
	onMount(() => {
		showTitle('#heroTitle');
		showBuy('#showBuy');
	});
</script>

<section class="sechero">
	<div class="sechero-main">
		<p id="heroTitle" class="sechero-main-title">iPhone 15 Pro</p>
		<div class="sechero-main-divvideo">
			<video src={videoSrc} autoplay muted playsinline preload="auto"></video>
		</div>
	</div>
	<div id="showBuy" class="sechero-footer">
		<a href="#highlights">Buy</a>
		<p>From $199/month or $999</p>
	</div>
</section>
