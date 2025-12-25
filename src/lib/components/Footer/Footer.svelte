<script lang="ts">
	import './footer.css';
	import { footerLinks } from '../../constants';
	import gsap from 'gsap';
	const currentYear = new Date().getFullYear();

	$effect(() => {
		gsap.from('#f_box', {
			scrollTrigger: {
				trigger: '#f_box',
				start: 'top 90%'
			},
			opacity: 0,
			y: 50,
			duration: 1.5,
			ease: 'easeInOut'
		});
	});
</script>

<!-- 页脚核心容器：黑色背景、细边框、内边距、居中布局 -->
<footer class="footer">
	<!-- 内容容器：限制最大宽度、水平居中 -->
	<div id="f_box" class="footer__wrapper">
		<!-- 顶部信息区：购物指引+联系电话 -->
		<div class="footer__top">
			<div class="footer__info">
				<p class="footer__shop-tip">
					More ways to shop:
					<span class="footer__link">Find an Apple Store</span>
					or
					<span class="footer__link">other retailer</span>
					near you.
				</p>
				<p class="footer__tel">Or call 000800-040-1966</p>
			</div>
		</div>

		<!-- 工业风分割线：极细低对比度 -->
		<div class="footer__divider"></div>

		<!-- 底部版权+链接区：响应式布局 -->
		<div class="footer__bottom">
			<!-- 版权信息：视觉后退，不抢眼 -->
			<p class="footer__copyright">
				Copyright © {currentYear} Apple Inc. All rights reserved.
			</p>

			<!-- 链接组：流式换行布局 -->
			<div class="footer__links">
				{#each footerLinks as link, i}
					<div class="footer__link-item group">
						<!-- 链接：现代悬停交互（变白+下划线） -->
						<p class="footer__nav-link">{link}</p>

						<!-- 分隔符：非最后一个显示，极淡配色 -->
						{#if i !== footerLinks.length - 1}
							<span class="footer__separator">/</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</footer>
