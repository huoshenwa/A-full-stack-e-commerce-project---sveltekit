<script>
	import './navbar.css';
	import appleImg from '$lib/assets/images/apple.svg';
	import searchImg from '$lib/assets/images/search.svg';
	import bagImg from '$lib/assets/images/bag.svg';
	import { navLists } from '../../constants/index';
	import { goto } from '$app/navigation';
	const goToProduct = () => {
		goto('/products');
	};
</script>

<header class="header">
	<nav class="navbar">
		<img src={appleImg} alt="Apple" width={14} height={18} />
		<div class="navbar-box">
			{#each navLists as nav (nav)}
				<div class="navbar-box-item" onclick={goToProduct}>{nav}</div>
			{/each}
		</div>
		<div class="navbar-boxIcons">
			<img src={searchImg} alt="search" width={18} height={18} />
			<img src={bagImg} alt="bag" width={18} height={18} />
		</div>
	</nav>
</header>
<!-- <header class="header">
	<nav class="navbar">
		<img src={appleImg} alt="Apple" width={14} height={18} />
		<div class="flex flex-1 justify-center max-sm:hidden">
			{#each navLists as nav (nav)}
				<div class="px-5 text-sm cursor-pointer text-gray-300 hover:text-white transition-all">{nav}</div>
			{/each}
		</div>
      <div class="flex items-baseline gap-7 max-sm:justify-end max-sm:flex-1">
            <img src={searchImg} alt="search" width={18} height={18}>
            <img src={bagImg} alt="bag" width={18} height={18}>
        </div> 
	</nav>
</header> -->
