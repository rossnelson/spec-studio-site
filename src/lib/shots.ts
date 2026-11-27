import { asset } from '$app/paths';

/**
 * The stills of the app in the guides, from the test copy on the demo spec
 * (scripts/shots/). Each one has a light file (TokyoNight Day) and a dark file
 * (TokyoNight Storm) in static/shots/: <name>.webp and <name>-dark.webp.
 * A guide shows one with `![<alt text>](shot:<name> "<caption>")`.
 */
export const shots = {
	'areas-sidebar': { width: 1600, height: 1000 },
	'project-view': { width: 1600, height: 1000 }
} as const;

export type ShotName = keyof typeof shots;

type Asset = Parameters<typeof asset>[0];
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The figure of a still: a <picture> whose dark source the browser picks from
 * the system setting, with no JavaScript, the same as Sketch.svelte. The image
 * loads lazily, and its width and height keep the page from moving.
 */
export function shotFigure(name: ShotName, alt: string, caption?: string): string {
	const { width, height } = shots[name];
	const light = escape(asset(`shots/${name}.webp` as Asset));
	const dark = escape(asset(`shots/${name}-dark.webp` as Asset));
	return (
		`<figure class="shot" data-testid="shot" data-shot="${name}">` +
		`<picture>` +
		`<source srcset="${dark}" media="(prefers-color-scheme: dark)" />` +
		`<img src="${light}" alt="${escape(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" />` +
		`</picture>` +
		(caption ? `<figcaption>${escape(caption)}</figcaption>` : '') +
		`</figure>`
	);
}
