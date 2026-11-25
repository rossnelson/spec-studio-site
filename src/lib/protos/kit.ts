/**
 * The drawing kit of the guide prototypes: live SVG drawings of one part of
 * the Spec Studio window. They draw with the site's color tokens (classes in
 * app.css), so they follow the light and dark theme with no second image.
 *
 * Animation: each prototype loops over `cycle` seconds. `at(from, to)` gives
 * an element a class whose keyframes show it from `from` to `to` (fractions
 * of the cycle) and hide it outside. The base style of every element is its
 * final, visible state, so with reduced motion (app.css turns the animations
 * off) a prototype shows its end state. Elements that only show for a while
 * (a status that a later one replaces) are `transient`: reduced motion hides
 * them.
 */

export const esc = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pct = (f: number) => `${(Math.min(Math.max(f, 0), 1) * 100).toFixed(2)}%`;

export class Proto {
	private rules: string[] = [];
	private count = 0;

	constructor(
		readonly name: string,
		readonly cycle: number
	) {}

	private key(kind: string) {
		return `p-${this.name}-${kind}${this.count++}`;
	}

	/** Visible from `from` to `to`, hidden before and after. */
	at(from: number, to = 0.97): string {
		const k = this.key('a');
		const fade = 0.015;
		this.rules.push(
			`@keyframes ${k}{0%,${pct(from - 0.0001)}{opacity:0}${pct(from + fade)},${pct(to)}{opacity:1}${pct(to + fade)},100%{opacity:0}}`,
			`.${k}{animation:${k} ${this.cycle}s linear infinite}`
		);
		return k;
	}

	/** Text that types in from `from` to `to`, then stays until `until`. */
	typed(from: number, to: number, until = 0.97): string {
		const k = this.key('t');
		this.rules.push(
			`@keyframes ${k}{0%,${pct(from)}{clip-path:inset(0 100% 0 0)}${pct(to)},${pct(until)}{clip-path:inset(0 0 0 0)}${pct(until + 0.015)},100%{clip-path:inset(0 100% 0 0)}}`,
			`.${k}{animation:${k} ${this.cycle}s steps(${Math.max(8, Math.round((to - from) * this.cycle * 14))},end) infinite}`
		);
		return k;
	}

	/** A short press at `t`: the element scales down and back. */
	press(t: number): string {
		const k = this.key('p');
		this.rules.push(
			`@keyframes ${k}{0%,${pct(t - 0.012)},${pct(t + 0.03)},100%{transform:scale(1)}${pct(t)}{transform:scale(.94)}}`,
			`.${k}{animation:${k} ${this.cycle}s ease-in-out infinite;transform-box:fill-box;transform-origin:center}`
		);
		return k;
	}

	/** A soft pulse that repeats every `period` seconds. */
	pulse(period = 2): string {
		const k = this.key('u');
		this.rules.push(
			`@keyframes ${k}{0%,100%{opacity:1}50%{opacity:.45}}`,
			`.${k}{animation:${k} ${period}s ease-in-out infinite}`
		);
		return k;
	}

	/** A pointer that moves through `stops` ([t, x, y] in cycle fractions and drawing units). */
	pointer(stops: Array<[number, number, number]>): string {
		const k = this.key('m');
		const frames = stops.map(([t, x, y]) => `${pct(t)}{transform:translate(${x}px,${y}px)}`).join('');
		const first = stops[0];
		const last = stops[stops.length - 1];
		this.rules.push(
			`@keyframes ${k}{0%{transform:translate(${first[1]}px,${first[2]}px)}${frames}100%{transform:translate(${last[1]}px,${last[2]}px)}}`,
			`.${k}{animation:${k} ${this.cycle}s ease-in-out infinite}`
		);
		return `<g class="${k} transient"><path class="p-pointer" d="M0 0 L0 17 L4.5 12.5 L8 20 L11 18.6 L7.6 11.4 L13.5 11.4 Z"/></g>`;
	}

	/** The SVG, with its keyframes. `label` is what a screen reader says. */
	svg(width: number, height: number, label: string, body: string): string {
		return (
			`<svg class="proto" data-proto="${this.name}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">` +
			`<style>${this.rules.join('')}</style>${body}</svg>`
		);
	}
}

/** Text. `cls` picks the token color and the face: p-ink, p-soft, p-accent, p-mono, p-bold… */
export function text(x: number, y: number, content: string, cls = 'p-ink', extra = ''): string {
	return `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(content)}</text>`;
}

export function rect(x: number, y: number, w: number, h: number, cls: string, r = 6, extra = ''): string {
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${cls}" ${extra}/>`;
}

/** A Mac window: the frame, the traffic lights and the title. */
export function windowFrame(w: number, h: number, title: string, body: string): string {
	return (
		rect(1, 1, w - 2, h - 2, 'p-window', 12) +
		[22, 40, 58].map((x) => `<circle cx="${x}" cy="18" r="5.5" class="p-light"/>`).join('') +
		text(76, 22.5, title, 'p-soft p-ui p-small') +
		`<line x1="1" y1="36" x2="${w - 1}" y2="36" class="p-rule"/>` +
		body
	);
}

/** A check in a circle, for a done stage. */
export function check(cx: number, cy: number, cls = ''): string {
	return `<g class="${cls}"><circle cx="${cx}" cy="${cy}" r="7" class="p-ok-fill"/><path d="M${cx - 3.2} ${cy + 0.2} l2.2 2.3 l4.4 -4.8" class="p-ok-mark"/></g>`;
}

/** An empty ring, for a stage not reached yet. */
export function ring(cx: number, cy: number, cls = 'p-line'): string {
	return `<circle cx="${cx}" cy="${cy}" r="6.5" class="${cls}" fill="none"/>`;
}

/** The small round critter that stands for a spec in the sidebar. */
export function critter(cx: number, cy: number, r = 9, tone = 'p-critter'): string {
	return (
		`<circle cx="${cx}" cy="${cy}" r="${r}" class="${tone}"/>` +
		`<circle cx="${cx - r * 0.35}" cy="${cy - r * 0.1}" r="${r * 0.12}" class="p-eye"/>` +
		`<circle cx="${cx + r * 0.35}" cy="${cy - r * 0.1}" r="${r * 0.12}" class="p-eye"/>` +
		`<path d="M${cx - r * 0.28} ${cy + r * 0.3} q${r * 0.28} ${r * 0.28} ${r * 0.56} 0" class="p-mouth"/>`
	);
}

/** Grey lines that stand for text in a document. */
export function lines(x: number, y: number, widths: number[], gap = 13, cls = 'p-textline'): string {
	return widths.map((w, i) => rect(x, y + i * gap, w, 6, cls, 3)).join('');
}
