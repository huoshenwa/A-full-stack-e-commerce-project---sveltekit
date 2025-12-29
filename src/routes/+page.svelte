<script lang="ts">
	export const ssr = false;
	export const csr = true;
	import { Hero, Navbar, Highlights, Model, Features, HowItWorks, Footer } from '$components';
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';
	let button1: HTMLDivElement;
	import type { form } from '$app/server';
	onMount(() => {});
</script>

<main class="bg-black">
	<Navbar></Navbar>
	<Hero></Hero>
	<Highlights></Highlights>
	<Model></Model>
	<Features></Features>
	<HowItWorks></HowItWorks>
	<Footer></Footer>
</main>

<style>
</style>
