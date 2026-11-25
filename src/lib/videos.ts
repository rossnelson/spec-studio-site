import { asset } from '$app/paths';

// The site's videos, made with video/ (the app) and video/relay/ (the relay).
// video/publish.sh writes each one's MP4, poster and captions into static/video/.
// After a new video, set its length and size here.
export const videos = {
	app: {
		file: 'spec-studio',
		caption: 'Spec Studio in 3 minutes: the window, the five stages, the three modes and the review.',
		size: '33 MB'
	},
	relay: {
		file: 'spec-studio-relay',
		caption: 'The relay in 3 minutes: what it does, its store (JSON files by default, or Temporal) and attachments with an S3 bucket.',
		size: '19 MB'
	}
} as const;

export type VideoName = keyof typeof videos;

type Asset = Parameters<typeof asset>[0];
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The figure of a video. preload="none": the browser loads nothing of the MP4
 * until the visitor clicks play, only the poster. The guides render it from
 * Markdown (`![](video:relay)`), and Video.svelte renders it on the pages.
 */
export function videoFigure(name: VideoName): string {
	const v = videos[name];
	const src = escape(asset(`video/${v.file}.mp4` as Asset));
	const poster = escape(asset(`video/${v.file}-poster.webp` as Asset));
	const captions = escape(asset(`video/${v.file}.vtt` as Asset));
	return (
		`<figure class="video" data-testid="video" data-video="${name}">` +
		`<video controls preload="none" playsinline poster="${poster}" width="1280" height="720">` +
		`<source src="${src}" type="video/mp4" />` +
		`<track kind="captions" srclang="en" label="English" src="${captions}" />` +
		`<a href="${src}">Download the video (MP4)</a>` +
		`</video>` +
		`<figcaption>${escape(v.caption)} <a href="${src}" download>Download the video</a> (MP4, ${v.size}).</figcaption>` +
		`</figure>`
	);
}
