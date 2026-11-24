<script lang="ts">
	import { asset } from '$app/paths';

	// The demo video. preload="none": the browser loads nothing of the MP4
	// until the visitor clicks play, only the poster.
	type Asset = Parameters<typeof asset>[0];
	const src = asset('video/spec-studio.mp4' as Asset);
	const poster = asset('video/spec-studio-poster.webp' as Asset);
	const captions = asset('video/spec-studio.vtt' as Asset);

	let { class: className = '' }: { class?: string } = $props();
</script>

<figure class="video {className}" data-testid="video">
	<video controls preload="none" playsinline {poster} width="1280" height="720">
		<source {src} type="video/mp4" />
		<track kind="captions" srclang="en" label="English" src={captions} />
		<a href={src}>Download the demo video (MP4)</a>
	</video>
	<figcaption>Spec Studio in under three minutes: the app, the relay and its backends.</figcaption>
</figure>

<style>
	.video {
		margin: 0;
	}

	video {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		background: #16161e;
		border: 1.5px solid var(--rule-strong);
	}

	figcaption {
		margin-top: 8px;
		font-size: max(0.95rem, calc(1.6 * var(--u)));
		color: var(--ink-soft);
	}
</style>
