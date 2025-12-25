<script lang="ts">
	import './features.css';
	import { explore1Img, explore2Img, exploreVideo } from '../../utils';
	import { animateWithGsap } from '../../utils/animations';
	import gsap from 'gsap';

	let videoRef: HTMLVideoElement | undefined = $state();

	$effect(() => {
		gsap.to('#exploreVideo', {
			scrollTrigger: {
				trigger: '#exploreVideo',
				toggleActions: 'play pause reverse restart',
				start: '-10% bottom'
			},
			onComplete: () => {
				if (videoRef) videoRef.play();
			}
		});

		animateWithGsap('#features_title', { y: 0, opacity: 1 });

		animateWithGsap('.g_grow', { scale: 1, opacity: 1, ease: 'power1' }, { scrub: 5.5 });

		animateWithGsap('.g_text', { y: 0, opacity: 1, ease: 'power2.inOut', duration: 1 });
	});
</script>

<!-- iPhone 15 Pro 钛金属特性展示区块：锌色背景、相对定位、溢出隐藏、全屏宽度、垂直居中布局 -->
<section class="feaSection">
	<!-- 内容容器：限制最大屏幕宽度 -->
	<div class="feaSection__content-wrapper">
		<!-- 区域标题容器：响应式底部间距、全屏宽度、移动端左侧内边距 -->
		<div class="feaSection__title-container">
			<h1 id="features_title" class="feaSection__main-heading">Explore the full story.</h1>
		</div>

		<!-- 核心内容区：垂直布局、居中对齐、响应式垂直间距（更紧凑的视觉效果） -->
		<div class="feaSection__core-content">
			<!-- 宣传语区域：全屏宽度、居中布局、移动端内边距 -->
			<div class="feaSection__slogan-area">
				<h2 class="feaSection__slogan-text">iPhone.</h2>
				<h2 class="feaSection__slogan-text">Forged in titanium.</h2>
			</div>

			<!-- 媒体展示区：视频+图片网格，垂直布局、居中、响应式间距、全屏宽度 -->
			<div class="feaSection__media-area">
				<!-- 核心视频容器：相对定位、响应式高度、全屏宽度、垂直居中 -->
				<div class="feaSection__video-container">
					<video
						playsinline
						id="exploreVideo"
						class="feaSection__feature-video"
						preload="none"
						muted
						autoplay
						bind:this={videoRef}
					>
						<source src={exploreVideo} type="video/mp4" />
					</video>
				</div>

				<!-- 图片网格容器：响应式布局（移动端垂直/桌面端水平）、间距、全屏宽度 -->
				<div class="feaSection__image-grid">
					<!-- 第一张钛金属图片：溢出隐藏、弹性占比、响应式高度、圆角 -->
					<div class="feaSection__image-item">
						<img src={explore1Img} alt="titanium" class="g_grow feaSection__feature-image" />
					</div>
					<!-- 第二张钛金属图片：溢出隐藏、弹性占比、响应式高度、圆角 -->
					<div class="feaSection__image-item">
						<img src={explore2Img} alt="titanium 2" class="g_grow feaSection__feature-image" />
					</div>
				</div>
			</div>

			<!-- 文字描述区：响应式布局、顶部对齐、居中、间距、全屏宽度、底部内边距 -->
			<div class="feaSection__desc-area">
				<!-- 第一段描述：弹性占比、居中对齐 -->
				<div class="feaSection__desc-column">
					<p class="feaSection__desc-text g_text">
						iPhone 15 Pro is {' '}
						<span class="feaSection__highlight-text">
							the first iPhone to feature an aerospace-grade titanium design
						</span>, using the same alloy that spacecrafts use for missions to Mars.
					</p>
				</div>

				<!-- 第二段描述：弹性占比、居中对齐 -->
				<div class="feaSection__desc-column">
					<p class="feaSection__desc-text g_text">
						Titanium has one of the best strength-to-weight ratios of any metal, making these our {' '}
						<span class="feaSection__highlight-text"> lightest Pro models ever. </span>
						You'll notice the difference the moment you pick one up.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
