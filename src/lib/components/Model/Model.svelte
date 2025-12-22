<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import IPhoneViewer from './IPhoneViewer.svelte';
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
    if (width < 640) { // 小屏幕（手机）
      smallScale = 12;
      largeScale = 14;
    } else if (width < 1024) { // 中屏幕（平板）
      smallScale = 13;
      largeScale = 15;
    } else { // 大屏幕（桌面）
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
      ease: "power4.inOut"
    });
  });

  onMount(() => {
    // 初始化缩放比例
    updateModelScale();
    // 监听窗口大小变化
    window.addEventListener('resize', updateModelScale);
    
    // 入场动画
    gsap.from(".header-fade", {
      opacity: 0,
      x: -50,
      duration: 1.5,
      ease: "power3.out"
    });
    
    gsap.from(".controls-fade", {
      opacity: 0,
      y: 50,
      duration: 1.2,
      delay: 0.5,
      ease: "power3.out"
    });

    // 清理监听
    return () => {
      window.removeEventListener('resize', updateModelScale);
    };
  });
</script>

<main class="relative w-screen h-screen bg-black overflow-hidden">
  
  <!-- 头部文字：小屏幕隐藏 -->
  <header class="absolute top-12 left-10 md:top-20 md:left-24 z-20 header-fade pointer-events-none">
    <h1 class="text-5xl md:text-7xl font-black tracking-tighter heading-gradient hidden sm:block">
      iPhone 15 Pro
    </h1>
    <p class="text-xl md:text-2xl text-neutral-500 mt-4 font-medium hidden sm:block">
      Titanium. So strong. So light.
    </p>
    
    <div class="flex gap-8 mt-8 hidden sm:block">
      <div class="flex flex-col">
        <span class="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Weight</span>
        <span class="text-lg text-neutral-300 font-medium">187g</span>
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Materials</span>
        <span class="text-lg text-neutral-300 font-medium">Grade 5</span>
      </div>
    </div>
  </header>

  <!-- 模型滑块容器 -->
  <div class="w-full h-full relative">
    <div 
      bind:this={sliderRef}
      class="flex w-[200%] h-full will-change-transform"
    >
      <div class="w-1/2 h-full flex items-center justify-center">
        <div class="w-full h-full pt-20">
          <IPhoneViewer 
            item={selectedModel} 
            scale={smallScale} 
            isActive={currentSize === 'small'} 
          />
        </div>
      </div>
      
      <div class="w-1/2 h-full flex items-center justify-center">
        <div class="w-full h-full pt-20">
          <IPhoneViewer 
            item={selectedModel} 
            scale={largeScale} 
            isActive={currentSize === 'large'} 
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 底部控制栏 -->
  <div class="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-6 controls-fade">
    <div class="glass-morphism rounded-[3rem] p-5 flex flex-col md:flex-row items-center justify-between gap-6">
      
      <!-- 颜色选择器 -->
      <div class="flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/5">
        {#each models as model}
          <button 
            class="relative w-9 h-9 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            style="background-color: {model.color[0]};"
            onclick={() => selectedModel = model}
            aria-label={model.title}
          >
            {#if selectedModel.id === model.id}
              <div class="absolute inset-0 rounded-full border-2 border-white scale-125 transition-transform duration-500"></div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- 尺寸选择器 -->
      <div class="relative flex items-center bg-white/5 p-1 rounded-full h-11 border border-white/5">
        <div 
          class="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style="left: {currentSize === 'small' ? '4px' : 'calc(50% + 2px)'}; width: calc(50% - 6px);"
        ></div>
        
        {#each sizes as size}
          <button 
            class="relative z-10 w-24 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-500 {currentSize === size.value ? 'text-black' : 'text-neutral-500'}"
            onclick={() => currentSize = size.value}
          >
            {size.label}
          </button>
        {/each}
      </div>

    </div>
  </div>

</main>

<style>
  /* 渐变标题样式（如果需要） */
  /* .heading-gradient {
    background: linear-gradient(90deg, #ffffff, #a0a0a0);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  } */

  /* 毛玻璃效果 */
  /* .glass-morphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  } */
</style>