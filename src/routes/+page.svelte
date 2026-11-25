<script lang="ts">
	import Hero from '../lib/sections/Hero.svelte';
	import Stages from '../lib/sections/Stages.svelte';
	import Details from '../lib/sections/Details.svelte';
	import Footer from '../lib/layout/Footer.svelte';
	import Video from '../lib/Video.svelte';
	import Share from '../lib/layout/Share.svelte';

	const description =
		'Spec Studio is a Mac app for spec-driven development with Claude Code. Write a spec with Claude, then plan, build, review and merge it in one window.';
</script>

<svelte:head>
	<title>Spec Studio</title>
	<meta name="description" content={description} />
	<meta name="color-scheme" content="light dark" />
	<meta name="theme-color" content="#f6f1e6" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#1a1917" media="(prefers-color-scheme: dark)" />
</svelte:head>

<Share slug="home" path="/" title="Spec Studio" {description} />

<main>
	<Hero />
	<section class="page demo" aria-label="Demo video">
		<Video />
	</section>
	<Stages />
	<Details />
</main>

<Footer />

<style>
	.demo {
		margin-block: max(32px, calc(5 * var(--u)));
	}
</style>
