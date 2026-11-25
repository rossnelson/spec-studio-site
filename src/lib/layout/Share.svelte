<script lang="ts">
	import { cardUrl, siteUrl } from '../share';

	/**
	 * The tags that Slack, iMessage, X and the rest read for a link preview:
	 * the page's title and summary, and its share card (static/share/<slug>.png).
	 */
	let { slug, path, title, description }: { slug: string; path: string; title: string; description: string } = $props();
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Spec Studio" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${siteUrl}${path}`} />
	<meta property="og:image" content={cardUrl(slug)} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={`${title}: Spec Studio's creatures on a ground line`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={cardUrl(slug)} />
</svelte:head>
