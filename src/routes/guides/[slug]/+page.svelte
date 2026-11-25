<script lang="ts">
	import { resolve } from '$app/paths';
	import TopBar from '../../../lib/layout/TopBar.svelte';
	import Footer from '../../../lib/layout/Footer.svelte';
	import { copyButtons } from '../../../lib/copy';
	import Share from '../../../lib/layout/Share.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const guide = $derived(data.guide);
</script>

<svelte:head>
	<title>{guide.title} · Spec Studio guides</title>
	<meta name="description" content={guide.summary} />
	<meta name="color-scheme" content="light dark" />
</svelte:head>

<Share slug={guide.slug} path={`/guides/${guide.slug}/`} title={`${guide.title} · Spec Studio guides`} description={guide.summary} />

<TopBar />

<main class="page guide-page">
	<p class="crumb"><a href={resolve('/guides')}>Guides</a></p>
	<h1>{guide.title}</h1>
	<p class="summary">{guide.summary}</p>
	<!-- The HTML comes from our own Markdown in src/guides/, rendered at build time. -->
	<article class="prose" data-testid="guide" {@attach copyButtons}>
		{@html guide.html}
	</article>
	{#if data.next}
		<p class="next">Next: <a href={resolve('/guides/[slug]', { slug: data.next.slug })}>{data.next.title}</a></p>
	{/if}
</main>

<Footer />
