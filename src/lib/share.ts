/**
 * The share cards: the picture that Slack, iMessage, X and the rest show for
 * a link to the site (og:image). Each card is an SVG, 1200 by 630, in the
 * site's paper and ink, with the page's title and the spec creatures of the
 * app (critter.ts). `scripts/share-cards.mjs` renders each one to
 * static/share/<slug>.png, because those services show PNG and JPEG only.
 */
import { critter, type Mood } from './protos/critter';

export type Card = { slug: string; kicker: string; title: string; summary: string };

/** The site's public address, for the absolute og:image and og:url. */
export const siteUrl = 'https://spec-studio-app.github.io/site';

export function cardUrl(slug: string): string {
	return `${siteUrl}/share/${slug}.png`;
}

const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Splits text into lines of at most `max` characters, at spaces. */
export function wrap(text: string, max: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(' ')) {
		if (line && (line + ' ' + word).length > max) {
			lines.push(line);
			line = word;
		} else line = line ? `${line} ${word}` : word;
	}
	if (line) lines.push(line);
	return lines;
}

/** The creatures on the card's ground line: the demo spec, and the crew of the empty window. */
const CAST: Array<[string, Mood, number]> = [
	['maple', 'working', 118],
	['open-count', 'yours', 172],
	['poppy', 'shipped', 138],
	['truffle', 'asleep', 112]
];

/** A creature as a nested <svg> at x, y (its top left), `size` wide. */
function placed(name: string, mood: Mood, x: number, y: number, size: number): string {
	return critter(name, mood, size, false).replace('<svg class="critter"', `<svg class="critter" x="${x}" y="${y}"`);
}

export function card({ kicker, title, summary }: Card): string {
	const titleLines = wrap(title, title.length > 40 ? 22 : 18);
	const titleSize = titleLines.length > 2 ? 62 : 74;
	const summaryLines = wrap(summary, 52).slice(0, 3);
	const top = 214;
	const titleSvg = titleLines
		.map((line, i) => `<text x="80" y="${top + i * titleSize * 1.02}" class="title" font-size="${titleSize}">${esc(line)}</text>`)
		.join('');
	const summaryTop = top + titleLines.length * titleSize * 1.02 + 34;
	const summarySvg = summaryLines
		.map((line, i) => `<text x="80" y="${summaryTop + i * 38}" class="summary">${esc(line)}</text>`)
		.join('');
	// The cast stands on a ground line at the right, as the crew of the app's empty window.
	let x = 690;
	const ground = 540;
	const cast = CAST.map(([name, mood, size]) => {
		const svg = placed(name, mood, x, ground - size * 0.9, size);
		x += size * 0.86;
		return svg;
	}).join('');
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
		`<style>` +
		`.critter{--cr-edge:#1a1a1f;--cr-pen:rgb(0 0 0/.85);--cr-alert:#cc8c00}` +
		`.title{font-family:'Source Serif 4 Variable',Georgia,serif;font-weight:700;letter-spacing:-.02em;fill:#1b1c20}` +
		`.summary{font-family:'Source Serif 4 Variable',Georgia,serif;font-size:29px;fill:#4d4a45}` +
		`.kicker{font-family:'IBM Plex Mono',Menlo,monospace;font-size:22px;letter-spacing:.06em;fill:#b37a3a}` +
		`.brand{font-family:'Source Serif 4 Variable',Georgia,serif;font-weight:700;font-size:34px;fill:#1b1c20}` +
		`.url{font-family:'IBM Plex Mono',Menlo,monospace;font-size:20px;fill:#4d4a45}` +
		`</style>` +
		`<defs><pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#1b1c20" fill-opacity=".05"/></pattern></defs>` +
		`<rect width="1200" height="630" fill="#f6f1e6"/><rect width="1200" height="630" fill="url(#grain)"/>` +
		placed('pebble', 'yours', 72, 52, 64) +
		`<text x="148" y="96" class="brand">Spec Studio</text>` +
		`<text x="80" y="${top - 70}" class="kicker">${esc(kicker.toUpperCase())}</text>` +
		titleSvg +
		summarySvg +
		cast +
		`<path d="M672 ${ground} Q 900 ${ground - 3} 1160 ${ground + 1}" fill="none" stroke="#1b1c20" stroke-width="2.4" stroke-linecap="round"/>` +
		`<line x1="80" y1="578" x2="1120" y2="578" stroke="#1b1c20" stroke-opacity=".55" stroke-width="1.5"/>` +
		`<text x="80" y="612" class="url">spec-studio-app.github.io/site</text>` +
		`</svg>`
	);
}
