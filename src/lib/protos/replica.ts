/**
 * The kit of the app replicas: an SVG whose viewBox is the replica's size in
 * app points, with the app's HTML inside a <foreignObject>. The picture
 * scales with the page like an image, and the text lays out like the app's.
 *
 * Colors: the app takes its colors from a Ghostty theme. The replicas use
 * TokyoNight Day in the light scheme and TokyoNight Storm in the dark one
 * (app.css, `.rp`). Fonts: the system UI font and the system mono font.
 *
 * Motion: each replica loops over `cycle` seconds. `at(from, to)` shows an
 * element between two fractions of the cycle; `typed` reveals text from left
 * to right; `press` pushes a button. An element's base style is its final
 * state, so with reduced motion (app.css stops every animation) the replica
 * shows its end. `transient` marks what only shows for a while: reduced
 * motion hides it.
 */
import { critter, type Mood } from './critter';

export const esc = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pct = (f: number) => `${(Math.min(Math.max(f, 0), 1) * 100).toFixed(2)}%`;

export class Replica {
	private rules: string[] = [];
	private count = 0;

	constructor(
		readonly name: string,
		readonly cycle: number
	) {}

	private key(kind: string) {
		return `r-${this.name}-${kind}${this.count++}`;
	}

	/** Visible from `from` to `to` (fractions of the cycle). */
	at(from: number, to = 0.97): string {
		const k = this.key('a');
		this.rules.push(
			`@keyframes ${k}{0%,${pct(from - 0.0001)}{opacity:0}${pct(from + 0.012)},${pct(to)}{opacity:1}${pct(to + 0.012)},100%{opacity:0}}`,
			`.${k}{animation:${k} ${this.cycle}s linear infinite}`
		);
		return k;
	}

	/** Text that types in from `from` to `to`, and stays until `until`. */
	typed(from: number, to: number, until = 0.97): string {
		const k = this.key('t');
		const steps = Math.max(8, Math.round((to - from) * this.cycle * 16));
		this.rules.push(
			`@keyframes ${k}{0%,${pct(from)}{clip-path:inset(0 100% 0 0)}${pct(to)},${pct(until)}{clip-path:inset(0 0 0 0)}${pct(until + 0.012)},100%{clip-path:inset(0 100% 0 0)}}`,
			`.${k}{display:inline-block;animation:${k} ${this.cycle}s steps(${steps},end) infinite}`
		);
		return k;
	}

	/** A button press at `t`. */
	press(t: number): string {
		const k = this.key('p');
		this.rules.push(
			`@keyframes ${k}{0%,${pct(t - 0.012)},${pct(t + 0.03)},100%{transform:scale(1);filter:none}${pct(t)}{transform:scale(.95);filter:brightness(.92)}}`,
			`.${k}{animation:${k} ${this.cycle}s ease-in-out infinite}`
		);
		return k;
	}

	/** The mouse pointer, moving through `stops`: [t, x, y]. */
	pointer(stops: Array<[number, number, number]>): string {
		const k = this.key('m');
		const frames = stops.map(([t, x, y]) => `${pct(t)}{transform:translate(${x}px,${y}px)}`).join('');
		this.rules.push(
			`@keyframes ${k}{0%{transform:translate(${stops[0][1]}px,${stops[0][2]}px)}${frames}100%{transform:translate(${stops.at(-1)![1]}px,${stops.at(-1)![2]}px)}}`,
			`.${k}{animation:${k} ${this.cycle}s ease-in-out infinite}`
		);
		return (
			`<div class="rp-pointer transient ${k}"><svg width="16" height="22" viewBox="0 0 16 22">` +
			`<path d="M1 1 L1 18 L5.5 13.5 L9 21 L12 19.6 L8.6 12.4 L14.5 12.4 Z" fill="#000" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg></div>`
		);
	}

	/** The SVG around the replica's HTML. `label` is what a screen reader says. */
	svg(width: number, height: number, label: string, html: string, cls = ''): string {
		return (
			`<svg class="proto" data-proto="${this.name}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">` +
			`<style>${this.rules.join('')}</style>` +
			`<foreignObject x="0" y="0" width="${width}" height="${height}">` +
			`<div class="rp ${cls}" style="width:${width}px;height:${height}px">${html}</div>` +
			`</foreignObject></svg>`
		);
	}
}

/** A spec's creature, with the paper look of the app. */
export function crit(name: string, mood: Mood, size: number, animated = true): string {
	return critter(name, mood, size, animated);
}

/** The three traffic lights and the title of a window. */
export function titlebar(title: string, x = 0): string {
	return (
		`<div class="rp-titlebar" style="padding-left:${x + 14}px"><i></i><i></i><i></i>` +
		(title ? `<span>${esc(title)}</span>` : '') +
		`</div>`
	);
}

/** The stage strip of the header: done stages get a green check, the current one an accent ring. */
export function stages(current: number, shown = ['Spec', 'Plan', 'Build', 'Check', 'Merge']): string {
	return (
		`<div class="rp-stages">` +
		shown
			.map((stage, i) => {
				const state = i < current ? 'done' : i === current ? 'current' : 'todo';
				const mark =
					state === 'done'
						? `<svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" fill="var(--green)"/><path d="M3.6 6.7l2 2.1l3.9-4.3" fill="none" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
						: `<svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.6" fill="${state === 'current' ? 'var(--accent)' : 'none'}" fill-opacity=".25" stroke="${state === 'current' ? 'var(--accent)' : 'var(--faint)'}" stroke-width="1.4"/></svg>`;
				return (
					(i ? `<b class="${i <= current ? 'done' : ''}"></b>` : '') +
					`<span class="rp-stage ${state}">${mark}<em>${stage}</em></span>`
				);
			})
			.join('') +
		`</div>`
	);
}

/** A small check in a circle, as in the review steps. */
export function tick(color = 'var(--green)'): string {
	return `<svg class="rp-tick" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="${color}"/><path d="M3.3 6.2l1.8 1.9l3.6-4" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** An empty ring, for a step not reached yet. */
export function todo(): string {
	return `<svg class="rp-tick" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.2" fill="none" stroke="var(--faint)" stroke-width="1.3"/></svg>`;
}

/** SF Symbols the replicas need, drawn as small line icons. */
export const icon = {
	folder: `<svg class="rp-icon" width="15" height="12" viewBox="0 0 15 12"><path d="M1 2.5a1 1 0 0 1 1-1h3.4l1.3 1.4H13a1 1 0 0 1 1 1V10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
	folderAdd: `<svg class="rp-icon" width="18" height="14" viewBox="0 0 18 14"><path d="M1 3.5a1 1 0 0 1 1-1h3.4l1.3 1.4H12M14 9v2.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-8" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M14.5 1v6M11.5 4h6" stroke="currentColor" stroke-width="1.2"/></svg>`,
	chat: `<svg class="rp-icon" width="15" height="13" viewBox="0 0 15 13"><path d="M2 1.5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6l-3 2.5V9.5H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
	plus: `<svg class="rp-icon" width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.2"/></svg>`,
	chevron: `<svg class="rp-icon" width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 3l3 3l3-3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`,
	sidebar: `<svg class="rp-icon" width="16" height="13" viewBox="0 0 16 13"><rect x=".6" y=".6" width="14.8" height="11.8" rx="2" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M5.5 1v11" stroke="currentColor" stroke-width="1.1"/></svg>`,
	expand: `<svg class="rp-icon" width="12" height="12" viewBox="0 0 12 12"><path d="M7 1h4v4M5 11H1V7M11 1L7 5M1 11l4-4" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
	lines: `<svg class="rp-icon" width="14" height="10" viewBox="0 0 14 10"><path d="M1 1h12M1 5h12M1 9h12" stroke="currentColor" stroke-width="1.2"/></svg>`,
	terminal: `<svg class="rp-icon" width="15" height="12" viewBox="0 0 15 12"><rect x=".6" y=".6" width="13.8" height="10.8" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M3.5 4l2 1.8l-2 1.8M7 8h3.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
	bolt: `<svg class="rp-icon" width="12" height="14" viewBox="0 0 12 14"><path d="M7 1L2 8h4l-1 5l5-7H6z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>`,
	party: `<svg class="rp-icon" width="14" height="14" viewBox="0 0 14 14"><path d="M2 12.5l3-8l5 5z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M8 2.5l.5-1.3M10.6 4.2l1.3-.7M11.5 6.8h1.4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
	person: `<svg class="rp-icon" width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.4" fill="currentColor"/><circle cx="7" cy="5.6" r="2.1" fill="var(--bg)"/><path d="M3.3 11.3c.9-1.8 2.2-2.6 3.7-2.6s2.8.8 3.7 2.6" fill="var(--bg)"/></svg>`,
	alert: `<svg class="rp-icon" width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.4" fill="currentColor"/><path d="M7 3.5v4.2" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="10.2" r=".95" fill="var(--bg)"/></svg>`,
	link: `<svg class="rp-icon" width="8" height="8" viewBox="0 0 8 8"><path d="M2 6l4-4M3 2h3v3" fill="none" stroke="currentColor" stroke-width="1"/></svg>`
};
