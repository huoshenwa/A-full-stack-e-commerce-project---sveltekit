<script lang="ts">
  import './videocarousel.css'
  import { pauseImg, playImg, replayImg } from '$lib/utils';
  import { hightlightsSlides } from '../../constants'
  import { onMount, untrack } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  // 引用数组
  const videoRef: HTMLVideoElement[] =$state([]);
  const videoDivRef: HTMLSpanElement[] = $state([]);
  const videoSpanRef: HTMLSpanElement[] = $state([]);
  
  // 状态管理
  let videoState = $state({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false
  });

  // 用于在 effect 之间共享数据，不需要响应式
  let tickerFunc: (() => void) | null = null;

  // 处理各种视频控制逻辑
  const handleProcess = (type: string, i?: number) => {
    switch(type) {
      case 'video-end':
        videoState.videoId = i! + 1;
        break;
      case 'video-last':
        videoState.isLastVideo = true;
        break;
      case 'video-reset':
        videoState.isLastVideo = false;
        videoState.videoId = 0;
        break;
      case 'pause':
      case 'play':
        videoState.isPlaying = !videoState.isPlaying;
        break;
    }
  };

  // 1. 滚动触发初始化 (只执行一次)
  onMount(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#carouselHeader',
      start: 'top 80%',
      onEnter: () => {
        videoState.startPlay = true;
        videoState.isPlaying = true;
      }
    });
    return () => trigger.kill();
  });

  // 2. 处理滑块移动动画
  $effect(() => {
    const id = videoState.videoId;
    gsap.to(".slider", {
      x: `${-100 * id}%`,
      duration: 2,
      ease: "power2.inOut",
    });
  });

  // 3. 处理视频播放/暂停
  $effect(() => {
    // 追踪必要状态
    const activeId = videoState.videoId;
    const playing = videoState.isPlaying;
    const started = videoState.startPlay;

    // 使用 untrack 避免在执行播放操作时意外触发不必要的追踪
    untrack(() => {
      const currentVideo = videoRef[activeId];
      if (!currentVideo) return;

      if (playing && started) {
        currentVideo.play().catch(() => {
          // 处理浏览器禁止自动播放的情况
          videoState.isPlaying = false;
        });
      } else {
        currentVideo.pause();
      }
    });
  });

  // 4. 核心：进度条动画逻辑
  $effect(() => {
    const activeId = videoState.videoId;
    const playing = videoState.isPlaying;

    // 清理逻辑：每当 videoId 变化，先重置所有进度条状态
    untrack(() => {
      videoSpanRef.forEach((span, i) => {
        if (i !== activeId) {
          gsap.to(span, { width: 0, backgroundColor: '#afafaf', duration: 0.3 });
          gsap.to(videoDivRef[i], { width: '12px', duration: 0.3 });
        }
      });
    });

    if (playing) {
      // 创建 Ticker
      tickerFunc = () => {
        const video = videoRef[activeId];
        const span = videoSpanRef[activeId];
        const div = videoDivRef[activeId];

        if (video && span && div) {
          const progress = video.currentTime / video.duration;
          
          // 更新容器宽度
          gsap.to(div, {
            width: window.innerWidth < 760 ? "10vw" : window.innerWidth < 1200 ? "10vw" : "4vw",
            duration: 0.2,
            ease:'sine.in'
          });

          // 瞬间更新内部进度条
          gsap.set(span, {
            width: `${progress * 100}%`,
            backgroundColor: "white",

          });
        }
      };
      gsap.ticker.add(tickerFunc);
    }

    return () => {
      if (tickerFunc) {
        gsap.ticker.remove(tickerFunc);
        tickerFunc = null;
      }
      
      // 视频结束或切换时，将当前的进度条收拢为圆点
      untrack(() => {
        const span = videoSpanRef[activeId];
        const div = videoDivRef[activeId];
        if (span && div) {
          gsap.to(div, { width: "12px", duration: 0.3 ,ease:'power2-in'})
          gsap.to(span, { backgroundColor: "#afafaf", duration: 0.3,ease:'power2' });
        }
      });
    };
  });
</script>

<!-- 轮播图容器 -->
<div id='carouselHeader'>
  {#each hightlightsSlides as list, i (list.id)}
    <div class="slider">
      <div class="slider-box">
        <!-- 视频容器 -->
        <div class="video-box">
          <video
            bind:this={videoRef[i]}
            class="video"
            playsinline={true}
            preload="metadata"
            muted
            onplay={() => {
              videoState.isPlaying = true
            }}
            onended={() => handleProcess(i === 3 ? 'video-last' : 'video-end', i)}
          >
            <source src={list.video} type="video/mp4" />
          </video>
        </div>
        
        <!-- 视频说明文字 -->
        <div class="video-text-box">
          {#each list.textLists as text (text)}
            <p>{text}</p>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- 控制器和进度指示器 -->
<div id="carouselFooter">
  <!-- 进度指示点容器 -->
  <div id="points-box">
    {#each hightlightsSlides as _, i (i)}
      <span
        bind:this={videoDivRef[i]}
        class="point-outside"
      >
        <span
          bind:this={videoSpanRef[i]}
          class="point-inside"
        ></span>
      </span>
    {/each}
  </div>
  
  <!-- 控制按钮 -->
  <button id="control-btn">
    <img
      src={videoState.isLastVideo ? replayImg : !videoState.isPlaying ? playImg : pauseImg}
      alt={videoState.isLastVideo ? 'replay' : !videoState.isPlaying ? 'play' : 'pause'}
      onclick={() => {
        if (videoState.isLastVideo) {
          handleProcess("video-reset")
        } else if (!videoState.isPlaying) {
          handleProcess("play")
        } else {
          handleProcess("pause")
        }
      }}
    />
  </button>
</div>

