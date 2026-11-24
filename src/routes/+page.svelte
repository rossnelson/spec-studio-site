<script lang="ts">
	import Hero from '../lib/sections/Hero.svelte';
	import Stages from '../lib/sections/Stages.svelte';
	import Details from '../lib/sections/Details.svelte';
	import Footer from '../lib/layout/Footer.svelte';

	const description =
		'Spec Studio is a native macOS app for spec-driven development with Claude Code. Write a spec with Claude, and move it through five stages with an approval gate at each one.';
</script>

<svelte:head>
	<title>Spec Studio</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Spec Studio" />
	<meta property="og:description" content={description} />
	<meta name="color-scheme" content="light dark" />
	<meta name="theme-color" content="#f6f1e6" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#1a1917" media="(prefers-color-scheme: dark)" />
</svelte:head>

<main>
	<Hero />
	<Stages />
	<Details />
</main>

<Footer />
