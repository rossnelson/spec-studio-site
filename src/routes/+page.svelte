<script lang="ts">
	import Hero from '../lib/sections/Hero.svelte';
	import Stages from '../lib/sections/Stages.svelte';
	import Details from '../lib/sections/Details.svelte';
	import { releasesUrl } from '../lib/releases';

	const description =
		'Spec Studio is a native macOS app for spec-driven development with Claude Code. Write a spec with Claude, and move it through five stages with an approval gate at each one.';
</script>

<svelte:head>
	<title>Spec Studio</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Spec Studio" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#f6f1e6" />
</svelte:head>

<main>
	<Hero />
	<Stages />
	<Details />
</main>

<footer class="page">
	<span class="name">Spec Studio</span>
	<a href={releasesUrl}>Releases</a>
</footer>

<style>
	footer {
		display: flex;
		align-items: center;
		gap: 20px;
		padding-block: 20px 40px;
		border-top: 1px solid var(--hairline);
		font-size: 0.95rem;
	}

	.name {
		font-family: var(--display);
		font-weight: 700;
		padding-right: 20px;
		border-right: 1px solid var(--hairline);
	}

	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
