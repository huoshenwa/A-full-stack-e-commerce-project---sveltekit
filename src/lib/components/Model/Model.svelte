<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import IPhoneViewer from './IPhoneViewer.svelte';
	import './model.css';
	// 请确保 constants.ts 中导出 models 和 sizes 数组，示例结构：
	// export const models = [
	//   { id: 1, color: ['#000000'], title: 'Black Titanium' },
	//   { id: 2, color: ['#808080'], title: 'White Titanium' }
	// ];
	// export const sizes = [
	//   { label: 'Small', value: 'small' },
	//   { label: 'Large', value: 'large' }
	// ];
	import { models, sizes } from '../../constants';

	let currentSize = $state('small');
	let selectedModel = $state(models[0]);
	let sliderRef: HTMLDivElement;
	// 响应式模型缩放比例（随屏幕宽度变化）
	let smallScale = $state(15);
	let largeScale = $state(17);

	// 动态更新模型缩放比例
	const updateModelScale = () => {
		const width = window.innerWidth;
		// 自定义屏幕断点和对应缩放值
		if (width < 640) {
			// 小屏幕（手机）
			smallScale = 12;
			largeScale = 14;
		} else if (width < 1024) {
			// 中屏幕（平板）
			smallScale = 13;
			largeScale = 15;
		} else {
			// 大屏幕（桌面）
			smallScale = 14;
			largeScale = 16;
		}
	};

	$effect(() => {
		if (!sliderRef) return;
		const xPercent = currentSize === 'small' ? 0 : -50;
		gsap.to(sliderRef, {
			xPercent,
			duration: 1.8,
			ease: 'power4.inOut'
		});
	});

	onMount(() => {
		// 初始化缩放比例
		updateModelScale();
		// 监听窗口大小变化
		window.addEventListener('resize', updateModelScale);

		// 入场动画
		gsap.from('.header-fade', {
			scrollTrigger: {
				trigger: '.header-fade',
				start: '20% bottom',
				// end: '-5% 10%',
				toggleActions: 'play reset play none',
				// markers: true,
				invalidateOnRefresh: true // 窗口尺寸变化时重新计算触发位置,
				// 向下滚动：离开触发区（到达end位置）→ 执行退场动画
				// onLeave: () => {
				// 	gsap.to('.header-fade', {
				// 		opacity: 0,
				// 		y: -60,
				// 		duration: 1.5,
				// 		ease: 'circ'
				// 	});
				// }
			},
			opacity: 0,
			y: 60,
			duration: 2,
			ease: 'circ'
		});

		gsap.from('.controls-fade', {
			opacity: 0,
			y: 50,
			duration: 1.2,
			delay: 0.5,
			ease: 'power3.out'
		});

		// 清理监听
		return () => {
			window.removeEventListener('resize', updateModelScale);
		};
	});
</script>

<!-- 核心容器：iPhone 15 Pro展示页主区域，全屏黑色背景，溢出隐藏 -->
<main class="iphone-showcase">
	<!-- 头部信息区：小屏幕隐藏，绝对定位在左上角，仅展示不可交互 -->
	<header class="iphone-showcase__header header-fade">
		<!-- 主标题：响应式字号，黑色粗体，渐变文字，小屏隐藏 -->
		<h1 class="iphone-showcase__header-title heading-gradient">iPhone 15 Pro</h1>
		<!-- 副标题：描述钛金属特性，响应式字号，浅灰色，小屏隐藏 -->
		<p class="iphone-showcase__header-desc">Titanium. So strong. So light.</p>

		<!-- 规格信息容器：展示重量和材质，弹性布局，小屏隐藏 -->
		<div class="iphone-showcase__header-specs">
			<!-- 重量规格项：垂直弹性布局 -->
			<div class="iphone-showcase__header-spec-item">
				<span class="iphone-showcase__header-spec-label">Weight</span>
				<span class="iphone-showcase__header-spec-value">187g</span>
			</div>
			<!-- 材质规格项：垂直弹性布局 -->
			<div class="iphone-showcase__header-spec-item">
				<span class="iphone-showcase__header-spec-label">Materials</span>
				<span class="iphone-showcase__header-spec-value">Grade 5</span>
			</div>
		</div>
	</header>

	<!-- 3D模型滑块容器：全屏宽度高度，相对定位承载滑块 -->
	<div class="iphone-showcase__slider-container">
		<!-- 滑块主体：绑定DOM引用，200%宽度用于左右滑动，硬件加速优化 -->
		<div bind:this={sliderRef} class="iphone-showcase__slider">
			<!-- 小尺寸iPhone模型滑块项：占1/2宽度，居中展示 -->
			<div class="iphone-showcase__slider-item">
				<div class="iphone-showcase__slider-item-inner">
					<IPhoneViewer
						item={selectedModel}
						scale={smallScale}
						isActive={currentSize === 'small'}
					/>
				</div>
			</div>

			<!-- 大尺寸iPhone模型滑块项：占1/2宽度，居中展示 -->
			<div class="iphone-showcase__slider-item">
				<div class="iphone-showcase__slider-item-inner">
					<IPhoneViewer
						item={selectedModel}
						scale={largeScale}
						isActive={currentSize === 'large'}
					/>
				</div>
			</div>
		</div>

		<!-- 底部控制栏：绝对定位居中，承载颜色/尺寸选择器 -->
		<div class="iphone-showcase__controls">
			<!-- 控制栏外层容器：毛玻璃效果，圆角，响应式弹性布局 -->
			<div class="iphone-showcase__controls-wrapper">
				<!-- 颜色选择器：圆角背景，弹性布局，半透明白色边框 -->
				<div class="iphone-showcase__controls-color-picker">
					{#each models as model}
						<!-- 颜色选择按钮：圆形，过渡动画，背景色动态赋值 -->
						<button
							class="iphone-showcase__controls-color-btn"
							style="background-color: {model.color[0]};"
							onclick={() => (selectedModel = model)}
							aria-label={model.title}
						>
							{#if selectedModel.id === model.id}
								<!-- 选中状态边框：白色边框，缩放动画 -->
								<div class="iphone-showcase__controls-color-btn-active"></div>
							{/if}
						</button>
					{/each}
				</div>

				<!-- 尺寸选择器：相对定位，圆角背景，半透明白色边框 -->
				<div class="iphone-showcase__controls-size-picker">
					<!-- 尺寸选择滑块：绝对定位，白色背景，过渡动画，left值动态赋值 -->
					<div
						class="iphone-showcase__controls-size-picker-slider"
						style="left: {currentSize === 'small'
							? '4px'
							: 'calc(50% + 2px)'}; width: calc(50% - 6px);"
					></div>

					{#each sizes as size}
						<!-- 尺寸选择按钮：相对定位，响应式文字样式，颜色随选中状态变化 -->
						<button
							class="iphone-showcase__controls-size-btn"
							onclick={() => (currentSize = size.value)}
						>
							{size.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
