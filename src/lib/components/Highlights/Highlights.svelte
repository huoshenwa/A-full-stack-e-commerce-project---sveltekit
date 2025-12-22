<script>
	import { showTitle,showLink} from './motions';
	import { onMount } from 'svelte';
	import { VideoCarousel } from '$components';
	import watchImg from '../../assets/images/watch.svg';
	import rightImg from '../../assets/images/right.svg';
	import './highlights.css'
	onMount(() => {
		showTitle("#title")
		showLink(".link")
	});
</script>
<section id="highlights">
	<div class="highlights-header">
		<div class="highlights-header-box">
			<h1 id="title">Gets the highlights</h1>
			<div class="div_link">
				<p class="link">
					Watch the film
					<img src={watchImg} alt="watch">
				</p>
				<p class="link">
					Watch the event
					<img src={rightImg} alt="right">
				</p>
			</div>
		</div>
	</div>
	<!-- 轮播图 -->
	 <VideoCarousel></VideoCarousel>
</section>
<!-- 
<section
	id="highlights"
	class="common-padding bg-zinc-900
h-full w-screen overflow-hidden"
>
	<div class="screen-max-width">
		<div class="mb-12 w-full items-end justify-between md:flex">
			<h1 id="title" class="section-heading">Get the highlights</h1>

			<div class="flex flex-wrap items-end gap-5">
				<p class="link">
					Watch the film
					<img src={watchImg} alt="watch" class="ml-2" />
				</p>
				<p class="link">
					Watch the event
					<img src={rightImg} alt="right" class="ml-2" />
				</p>
			</div>
		</div>
		<VideoCarousel />
	</div>
</section> -->
