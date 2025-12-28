<script lang="ts">
	import './navbar.css';
	import appleImg from '$lib/assets/images/apple.svg';
	import searchImg from '$lib/assets/images/search.svg';
	import bagImg from '$lib/assets/images/bag.svg';
	import { navLists } from '../../constants/index';
	import { goto } from '$app/navigation';
	const goToProduct = (url: string) => {
		goto('/products' + url);
	};
</script>

<header class="header">
	<nav class="navbar">
		<img src={appleImg} alt="Apple" width={14} height={18} />
		<div class="navbar-box">
			{#each navLists as nav (nav)}
				{#if nav === 'Mac'}
					<button
						type="button"
						class="navbar-box-item"
						on:click={() => goToProduct('?categoryId=18b7933a-0ef9-4398-a2c8-8ee13e66ffee')}
					>
						{nav}
					</button>
				{:else if nav === 'iPhone'}
					<button
						type="button"
						class="navbar-box-item"
						on:click={() => goToProduct('?categoryId=8ec0903b-0634-442a-a97a-e3f134f7ea7e')}
					>
						{nav}
					</button>
				{:else}
					<button type="button" class="navbar-box-item" on:click={() => goToProduct('')}>
						{nav}
					</button>
				{/if}
			{/each}
		</div>
		<div class="navbar-boxIcons">
			<img src={searchImg} alt="search" width={18} height={18} />
			<img src={bagImg} alt="bag" width={18} height={18} />
		</div>
	</nav>
</header>
