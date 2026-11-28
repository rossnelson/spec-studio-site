import { asset } from '$app/paths';

/**
 * The stills of the app in the guides, from the test copy on the demo spec
 * (scripts/shots/). Each one has a light file (TokyoNight Day) and a dark file
 * (TokyoNight Storm) in static/shots/: <name>.webp and <name>-dark.webp.
 * A guide shows one with `![<alt text>](shot:<name> "<caption>")`.
 * A narrow still (a crop of one panel) shows at its own width, so that its
 * text stays readable on a phone and does not grow too large on a desktop.
 */
type Shot = { width: number; height: number; narrow?: boolean };

export const shots = {
	// The sidebar only (a 520 × 1220 crop of the window, at 2× scale).
	'areas-sidebar': { width: 520, height: 1220, narrow: true }
} satisfies Record<string, Shot>;

export type ShotName = keyof typeof shots;

type Asset = Parameters<typeof asset>[0];
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The figure of a still: a <picture> whose dark source the browser picks from
 * the system setting, with no JavaScript, the same as Sketch.svelte. The image
 * loads lazily, and its width and height keep the page from moving.
 */
export function shotFigure(name: ShotName, alt: string, caption?: string): string {
	const { width, height, narrow }: Shot = shots[name];
	const light = escape(asset(`shots/${name}.webp` as Asset));
	const dark = escape(asset(`shots/${name}-dark.webp` as Asset));
	return (
		`<figure class="shot${narrow ? ' narrow' : ''}" data-testid="shot" data-shot="${name}">` +
		`<picture>` +
		`<source srcset="${dark}" media="(prefers-color-scheme: dark)" />` +
		`<img src="${light}" alt="${escape(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" />` +
		`</picture>` +
		(caption ? `<figcaption>${escape(caption)}</figcaption>` : '') +
		`</figure>`
	);
}
