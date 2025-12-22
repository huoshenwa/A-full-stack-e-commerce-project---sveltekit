<script lang="ts">
  import { footerLinks } from '../../constants';
  
  // 获取当前年份，实现自动更新，这也是现代工程化的一个小细节
  const currentYear = new Date().getFullYear();
</script>

<!-- 
  布局容器：
  1. bg-black: 纯黑底色，深邃现代。
  2. py-20: 给予充足的垂直呼吸空间，不局促。
  3. border-t border-zinc-900: 顶部增加一道极细的深色边框，与上方内容形成硬朗的物理分割。
-->
<footer class="py-20 sm:px-10 px-5 bg-black w-full border-t border-zinc-900 flex-center">
  <div class="screen-max-width w-full mx-auto">
    
    <!-- 第一部分：信息指引 -->
    <!-- 使用 grid 布局来控制节奏，比单纯的 flex col 更稳定 -->
    <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
      <div class="flex flex-col gap-2">
        <p class="text-zinc-400 text-xs font-medium leading-relaxed">
          More ways to shop: 
          <span class="text-blue underline underline-offset-2 hover:text-blue-400 transition-colors cursor-pointer">
            Find an Apple Store
          </span>
          or 
          <span class="text-blue underline underline-offset-2 hover:text-blue-400 transition-colors cursor-pointer">
            other retailer
          </span>
          near you.
        </p>
        <p class="text-zinc-500 text-xs font-medium">
          Or call 000800-040-1966
        </p>
      </div>
    </div>

    <!-- 工业风分割线：极细，低对比度 -->
    <div class="bg-zinc-800 h-[1px] w-full mb-8 opacity-60"></div>

    <!-- 第二部分：版权与链接 -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      
      <!-- 版权信息：使用更暗的 Zinc-500，使其视觉后退，不抢眼 -->
      <p class="text-zinc-500 text-xs font-medium whitespace-nowrap">
        Copyright © {currentYear} Apple Inc. All rights reserved.
      </p>
      
      <!-- 链接组 -->
      <div class="flex flex-wrap gap-x-4 gap-y-2">
        {#each footerLinks as link, i}
          <div class="flex items-center group">
            <!-- 链接：默认暗灰，悬停变白，这是非常现代的交互动效 -->
            <p class="text-xs text-zinc-400 font-medium cursor-pointer transition-all duration-300 hover:text-white hover:underline underline-offset-4 decoration-zinc-600">
              {link}
            </p>
            
            <!-- 分隔符：只有非最后一个元素显示，且颜色极淡 -->
            {#if i !== footerLinks.length - 1}
              <span class="ml-4 text-zinc-700 text-[10px] select-none opacity-50">/</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</footer>