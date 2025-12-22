<script lang="ts">
  import { chipImg, frameImg, frameVideo } from '../../utils';
  import { animateWithGsap } from '../../utils/animations';
  import gsap from 'gsap';

  let videoRef: HTMLVideoElement | undefined = $state();

  $effect(() => {
    gsap.from('#chip', {
      scrollTrigger: {
        trigger: '#chip',
        start: '20% bottom'
      },
      opacity: 0,
      scale: 2,
      duration: 2,
      ease: 'power2.inOut'
    });

    animateWithGsap('.g_fadeIn', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.inOut'
    });
  });
</script>

<section class="common-padding bg-black w-full flex flex-col items-center mb-500">
   <!-- 新增：空白占位元素 -->
      <div class="w-full h-20 md:h-32 lg:h-40"></div>
  <div class="screen-max-width">
    
    <!-- 
      整体布局容器 
      gap-y-20: 稍微拉近内部元素距离，比之前的 32 更紧凑。
    -->
    <div class="flex flex-col items-center gap-y-20 md:gap-y-24">
      
      <!-- 
        核心修改：芯片区域
        1. mt-20 md:mt-32: 在原有 padding 基础上，强制增加顶部外边距，
           制造出您想要的“宽一点的空白”，实现视觉隔离。
        2. 图片尺寸：width="180" (原240)，让芯片看起来更精致，不那么突兀。
      -->
      <div id="chip" class="flex-center w-full mt-20 md:mt-32">
        <img 
          src={chipImg} 
          alt="chip" 
          width="180" 
          height="180" 
          class="drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]" 
        />
      </div>

      <!-- 标题区域 -->
      <div class="flex flex-col items-center w-full">
        <!-- text-4xl/6xl: 稍微调小标题字体 -->
        <h2 class="hiw-title text-4xl md:text-6xl text-center font-semibold">
          A17 Pro chip.
          <br /> A monster win for gaming.
        </h2>
        <p class="hiw-subtitle px-5 text-lg md:text-xl mt-4">
          It's here. The biggest redesign in the history of Apple GPUs.
        </p>
      </div>

      <!-- 
        游戏画面展示 
        max-w-3xl: 限制最大宽度 (之前是 4xl)，防止图片撑满屏幕，
        给左右留出更多黑色背景，更有电影感。
      -->
      <div class="w-full flex flex-col items-center max-w-[90vw] md:max-w-3xl">
        <div class="relative h-full flex-center w-full">
          <div class="overflow-hidden flex-center w-full relative z-10">
            <img 
              src={frameImg}
              alt="frame"
              class="bg-transparent relative z-10 w-full h-auto"
            />
          </div>
          <div class="hiw-video flex-center">
            <video 
              class="pointer-events-none object-cover w-full h-full rounded-[30px] md:rounded-[42px]" 
              playsinline 
              preload="none" 
              muted 
              autoplay 
              bind:this={videoRef}
            >
              <source src={frameVideo} type="video/mp4" />
            </video>
          </div>
        </div>
        <p class="text-gray-400 font-semibold text-center mt-4 text-base md:text-lg tracking-tight">Honkai: Star Rail</p>
      </div>

      <!-- 底部详情 -->
      <div class="w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-16 px-5 pb-10">
        <div class="flex-1 flex justify-center flex-col items-center md:items-start text-center md:text-left gap-y-6">
          <p class="hiw-text g_fadeIn text-lg md:text-xl">
            A17 Pro is an entirely new class of iPhone chip that delivers our {' '}
            <span class="text-white">
              best graphic performance by far
            </span>.
          </p>
          <p class="hiw-text g_fadeIn text-lg md:text-xl">
            Mobile {' '}
            <span class="text-white">
              games will look and feel so immersive
            </span>,
            with incredibly detailed environments and characters.
          </p>
        </div>
        
        <div class="flex-1 flex justify-center flex-col items-center text-center g_fadeIn md:pt-2">
          <p class="hiw-text mb-2 text-lg">New</p>
          <p class="hiw-bigtext mb-2 text-4xl md:text-5xl">Pro-class GPU</p>
          <p class="hiw-text text-lg">with 6 cores</p>
        </div>
      </div>
    </div>
  </div>
   <!-- 新增：空白占位元素 -->
      <div class="w-full h-20 md:h-32 lg:h-40"></div>
</section>