<script lang="ts">
	import { resolve } from '$app/paths';
	import TopBar from '../../lib/layout/TopBar.svelte';
	import Footer from '../../lib/layout/Footer.svelte';
	import Video from '../../lib/Video.svelte';
	import Share from '../../lib/layout/Share.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Guides · Spec Studio</title>
	<meta name="description" content="How to use Spec Studio, host the relay and choose its backends." />
	<meta name="color-scheme" content="light dark" />
</svelte:head>

<Share slug="guides" path="/guides/" title="Spec Studio guides" description="How to use Spec Studio, host the relay and choose its backends." />

<TopBar />

<main class="page guide-page">
	<h1>Guides</h1>
	<p class="summary">How to use Spec Studio, and how to reach it from Claude AI with the relay. Read them in order.</p>

	<div class="guide-video"><Video /></div>

	<ol class="guide-list" data-testid="guide-list">
		{#each data.guides as guide (guide.slug)}
			<li>
				<a href={resolve('/guides/[slug]', { slug: guide.slug })}>{guide.title}</a>
				<p>{guide.summary}</p>
			</li>
		{/each}
	</ol>
</main>

<Footer />
