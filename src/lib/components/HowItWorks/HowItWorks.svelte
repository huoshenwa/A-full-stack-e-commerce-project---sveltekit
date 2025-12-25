<script lang="ts">
	import './howItWorks.css';
	import { chipImg, frameImg, frameVideo } from '../../utils';
	import { animateWithGsap } from '../../utils/animations';
	import gsap from 'gsap';

	let videoRef: HTMLVideoElement | undefined = $state();

	$effect(() => {
		gsap.from('#chip', {
			scrollTrigger: {
				trigger: '#chip',
				start: '20% 80%'
			},
			opacity: 0,
			scale: 2,
			duration: 3,
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

<section class="a1Section">
	<div class="a1Section__content-wrapper">
		<div class="a1Section__content">
			<div id="chip" class="a1Section__chip-container">
				<img src={chipImg} alt="chip" width="180" height="180" class="a1Section__chip-img" />
			</div>

			<div class="a1Section__title-area">
				<h2 class="a1Section__main-title">
					A17 Pro chip.
					<br /> A monster win for gaming.
				</h2>
				<p class="a1Section__subtitle">
					It's here. The biggest redesign in the history of Apple GPUs.
				</p>
			</div>

			<div class="a1Section__game-display">
				<div class="a1Section__media-container">
					<div class="a1Section__frame-container">
						<img src={frameImg} alt="frame" class="a1Section__frame-img" />
					</div>
					<div class="a1Section__video-container">
						<video
							class="a1Section__game-video"
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
				<p class="a1Section__game-name">Honkai: Star Rail</p>
			</div>

			<div class="a1Section__bottom-details">
				<div class="a1Section__details-text">
					<p class="a1Section__details-paragraph g_fadeIn">
						A17 Pro is an entirely new class of iPhone chip that delivers our {' '}
						<span class="a1Section__highlight-text"> best graphic performance by far </span>.
					</p>
					<p class="a1Section__details-paragraph g_fadeIn">
						Mobile {' '}
						<span class="a1Section__highlight-text"> games will look and feel so immersive </span>,
						with incredibly detailed environments and characters.
					</p>
				</div>

				<div class="a1Section__gpu-feature g_fadeIn">
					<p class="a1Section__gpu-label">New</p>
					<p class="a1Section__gpu-title">Pro-class GPU</p>
					<p class="a1Section__gpu-desc">with 6 cores</p>
				</div>
			</div>
		</div>
	</div>
</section>
