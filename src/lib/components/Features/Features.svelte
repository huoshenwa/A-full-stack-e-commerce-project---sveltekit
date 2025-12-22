<script lang="ts">
  import { explore1Img, explore2Img, exploreVideo } from '../../utils';
  import { animateWithGsap } from '../../utils/animations';
  import gsap from 'gsap';

  let videoRef: HTMLVideoElement | undefined = $state();

  $effect(() => {
    gsap.to('#exploreVideo', {
      scrollTrigger: {
        trigger: '#exploreVideo',
        toggleActions: 'play pause reverse restart',
        start: '-10% bottom',
      },
      onComplete: () => {
        if (videoRef) videoRef.play();
      }
    });

    animateWithGsap('#features_title', { y: 0, opacity: 1 });
    
    animateWithGsap(
      '.g_grow',
      { scale: 1, opacity: 1, ease: 'power1' },
      { scrub: 5.5 }
    );
    
    animateWithGsap(
      '.g_text',
      { y: 0, opacity: 1, ease: 'power2.inOut', duration: 1 }
    );
  });
</script>

<section class="common-padding bg-zinc relative overflow-hidden w-full flex flex-col items-center">
  <div class="screen-max-width">
    
    <!-- 标题：字体稍减小，留白稍减小 -->
    <div class="mb-8 md:mb-12 w-full pl-5 md:pl-0">
      <h1 id="features_title" class="section-heading text-left text-4xl md:text-5xl lg:text-6xl">Explore the full story.</h1>
    </div>
    
    <!-- 整体垂直间距：gap-y-32 -> gap-y-24 (更紧凑) -->
    <div class="flex flex-col justify-center items-center gap-y-16 md:gap-y-24">
      
      <!-- 宣传语：字体从 7xl 降为 6xl，视觉更平衡 -->
      <div class="w-full flex flex-col items-center text-center px-5 md:px-0">
        <h2 class="text-3xl md:text-5xl lg:text-6xl font-semibold">iPhone.</h2>
        <h2 class="text-3xl md:text-5xl lg:text-6xl font-semibold">Forged in titanium.</h2>
      </div>

      <!-- 视频和图片区域 -->
      <div class="flex flex-col items-center gap-y-10 md:gap-y-16 w-full sm:px-10">
        
        <!-- 
          核心视频：高度从 50vh 降为 40vh。
          这样在1080p屏幕上，用户能同时看到标题和视频底部，视野更好。
        -->
        <div class="relative h-[30vh] md:h-[40vh] w-full flex items-center">
          <video 
            playsinline 
            id="exploreVideo" 
            class="w-full h-full object-cover object-center rounded-3xl" 
            preload="none" 
            muted 
            autoplay 
            bind:this={videoRef}
          >
            <source src={exploreVideo} type="video/mp4" />
          </video>
        </div>

        <!-- 图片网格：高度同步降为 40vh -->
        <div class="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
          <div class="overflow-hidden flex-1 h-[30vh] md:h-[40vh] rounded-3xl">
            <img src={explore1Img} alt="titanium" class="feature-video g_grow" />
          </div>
          <div class="overflow-hidden flex-1 h-[30vh] md:h-[40vh] rounded-3xl">
            <img src={explore2Img} alt="titanium 2" class="feature-video g_grow" />
          </div>
        </div>
      </div>

      <!-- 文字描述 -->
      <div class="w-full flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16 px-5 pb-10 md:pb-0">
        <div class="flex-1 flex justify-center">
          <p class="feature-text g_text text-base md:text-lg font-semibold leading-relaxed">
            iPhone 15 Pro is {' '}
            <span class="text-white">
              the first iPhone to feature an aerospace-grade titanium design
            </span>,
            using the same alloy that spacecrafts use for missions to Mars.
          </p>
        </div>

        <div class="flex-1 flex justify-center">
          <p class="feature-text g_text text-base md:text-lg font-semibold leading-relaxed">
            Titanium has one of the best strength-to-weight ratios of any metal, making these our {' '}
            <span class="text-white">
              lightest Pro models ever.
            </span>
            You'll notice the difference the moment you pick one up.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>