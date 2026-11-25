/**
 * Each spec's creature, as SVG: a port of `Critter.swift` in the app
 * (Sources/SpecStudio/Views/Critter.swift). The spec's name decides the looks
 * with the same FNV-1a hash, so a guide shows the same creature as the app.
 * The mood decides the face and the motion: it naps, works with Claude, looks
 * up at you on your turn, asks for a permission, waits, or wears a party hat.
 *
 * The drawing is in a 100 by 100 space. The edge colour follows the theme
 * (black ink on light, a soft edge of its own colour on dark) through CSS
 * custom properties, so one SVG serves both themes. Motion is CSS; with
 * reduced motion the creature stands still.
 */

export type Mood = 'asleep' | 'waking' | 'working' | 'yours' | 'permission' | 'waiting' | 'shipped';

const BODIES = ['round', 'square', 'bean', 'pear', 'drop', 'squat'] as const;
const TOPS = ['none', 'bearEars', 'catEars', 'antenna', 'sprout', 'horns', 'tuft', 'leaf'] as const;
const MARKS = ['none', 'spots', 'belly', 'stripes'] as const;
const SMILES = ['curve', 'wide', 'cat'] as const;
const EXTRAS = ['none', 'plain', 'freckles', 'tooth'] as const;
const HUES = [0.9, 0.54, 0.13, 0.73, 0.06, 0.47, 0.24, 0.97, 0.4, 0.66, 0.8, 0.6];

type Looks = {
	hue: number;
	body: (typeof BODIES)[number];
	top: (typeof TOPS)[number];
	mark: (typeof MARKS)[number];
	eyeGap: number;
	eyeSize: number;
	cheek: number;
	smile: (typeof SMILES)[number];
	extra: (typeof EXTRAS)[number];
};

/** FNV-1a over the UTF-8 bytes, 64 bit, as in the app. */
export function looks(name: string): Looks {
	const mask = (1n << 64n) - 1n;
	let hash = 0xcbf29ce484222325n;
	for (const byte of new TextEncoder().encode(name)) hash = ((hash ^ BigInt(byte)) * 0x100000001b3n) & mask;
	const pick = (n: number, shift: number) => Number((hash >> BigInt(shift)) % BigInt(n));
	return {
		hue: HUES[pick(HUES.length, 23)],
		body: BODIES[pick(BODIES.length, 37)],
		top: TOPS[pick(TOPS.length, 3)],
		mark: MARKS[pick(MARKS.length, 33)],
		eyeGap: [13, 15, 17][pick(3, 41)],
		eyeSize: [0.88, 1, 1.22][pick(3, 45)],
		smile: SMILES[pick(SMILES.length, 49)],
		cheek: [3.6, 4.5, 5.4][pick(3, 53)],
		extra: EXTRAS[pick(EXTRAS.length, 57)]
	};
}

/** SwiftUI's Color(hue:saturation:brightness:) as #rrggbb. */
function hsb(h: number, s: number, b: number): string {
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = b * (1 - s);
	const q = b * (1 - f * s);
	const t = b * (1 - (1 - f) * s);
	const [r, g, bl] = [
		[b, t, p],
		[q, b, p],
		[p, b, t],
		[p, q, b],
		[t, p, b],
		[b, p, q]
	][((i % 6) + 6) % 6];
	return '#' + [r, g, bl].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

const INK = '#1a1a1f';
const BLUSH = '#ffa8b8';
const LEAF = hsb(0.3, 0.38, 0.86);
const CREAM = hsb(0.12, 0.14, 1);

const n = (v: number) => +v.toFixed(2);
const oval = (cx: number, cy: number, rx: number, ry: number) =>
	`M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0Z`;
const arc = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => `M${n(ax)} ${n(ay)}Q${n(cx)} ${n(cy)} ${n(bx)} ${n(by)}`;
function petal(ax: number, ay: number, bx: number, by: number, w: number): string {
	const dx = bx - ax;
	const dy = by - ay;
	const len = Math.max(0.001, Math.hypot(dx, dy));
	const nx = (-dy / len) * w * 2;
	const ny = (dx / len) * w * 2;
	const mx = ax + dx * 0.45;
	const my = ay + dy * 0.45;
	return `M${n(ax)} ${n(ay)}Q${n(mx + nx)} ${n(my + ny)} ${n(bx)} ${n(by)}Q${n(mx - nx)} ${n(my - ny)} ${n(ax)} ${n(ay)}Z`;
}
const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
	`M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

function metrics(body: Looks['body']) {
	return {
		round: { topY: 30, earDX: 22, earY: 37, faceDY: 0 },
		square: { topY: 30, earDX: 22, earY: 33, faceDY: 0 },
		bean: { topY: 28, earDX: 16, earY: 33, faceDY: 0 },
		pear: { topY: 30, earDX: 13, earY: 36, faceDY: 3 },
		drop: { topY: 30, earDX: 20, earY: 37, faceDY: 1 },
		squat: { topY: 40, earDX: 25, earY: 46, faceDY: 5 }
	}[body];
}

function bodyPath(body: Looks['body']): string {
	switch (body) {
		case 'round':
			return oval(50, 59, 34, 29);
		case 'square':
			return roundRect(16, 30, 68, 58, 22);
		case 'bean':
			return roundRect(22, 28, 56, 60, 28);
		case 'squat':
			return oval(50, 64, 39, 24);
		case 'pear':
			return 'M50 30C60 30 84 50 85 68C86 82 70 88 50 88C30 88 14 82 15 68C16 50 40 30 50 30Z';
		case 'drop':
			return 'M16 72C16 46 30 30 50 30C70 30 84 46 84 72C84 83 78 88 68 88L32 88C22 88 16 83 16 72Z';
	}
}

let counter = 0;

/**
 * The creature of a spec as an <svg>, `size` CSS pixels wide.
 * `animated: false` draws it still (for a picture of one moment).
 */
export function critter(name: string, mood: Mood, size = 22, animated = true): string {
	const l = looks(name);
	const id = `cr${counter++}`;
	const detail = size >= 28;
	const dim = mood === 'asleep' ? 0.6 : mood === 'waking' ? 0.82 : 1;
	const tone = (s: number, b: number) => hsb(l.hue, s * dim, b * (0.74 + 0.26 * dim));
	const base = tone(0.34, 0.97);
	const deep = tone(0.52, 0.8);
	const edgeDark = hsb(l.hue, 0.4 * dim, 0.8 * (0.74 + 0.26 * dim));
	const width = detail ? 3.4 : 5;
	const lineW = detail ? 2.8 : 3.8;
	const m = metrics(l.body);
	const eyeY = 58 + m.faceDY;
	const shape = bodyPath(l.body);
	const outline = `fill="none" stroke="var(--cr-edge)" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
	const inkLine = `fill="none" stroke="${INK}" stroke-width="${lineW}" stroke-linecap="round" stroke-linejoin="round"`;
	const piece = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/><path d="${d}" ${outline}/>`;
	let out = '';

	// The top: ears, horns, an antenna, a sprout, a leaf or a tuft. The party hat takes a centred top's place.
	const centred = ['antenna', 'sprout', 'tuft', 'leaf'].includes(l.top);
	const ty = m.topY;
	if (!(mood === 'shipped' && centred)) {
		switch (l.top) {
			case 'bearEars':
				for (const side of [-1, 1]) {
					const x = 50 + side * m.earDX;
					out += piece(oval(x, m.earY - 3, 10, 10), base);
					if (detail) out += `<path d="${oval(x, m.earY - 3, 4.6, 4.6)}" fill="${BLUSH}" fill-opacity=".85"/>`;
				}
				break;
			case 'catEars':
				for (const side of [-1, 1]) {
					const x = 50 + side * m.earDX;
					out += piece(
						`M${x - 11} ${m.earY + 7}Q${x - 8 + side * 2} ${m.earY - 8} ${x + side * 5} ${m.earY - 16}Q${x + 8 + side * 2} ${m.earY - 8} ${x + 11} ${m.earY + 7}Z`,
						base
					);
				}
				break;
			case 'horns':
				for (const side of [-1, 1]) {
					const x = 50 + side * m.earDX * 0.8;
					out += piece(petal(x - side * 2, m.earY + 7, x + side * 5, m.earY - 14, 3.8), CREAM);
				}
				break;
			case 'antenna':
				out += `<path d="${arc(50, ty + 2, 55, ty - 11, 49, ty - 6)}" ${outline}/>`;
				out += piece(oval(56, ty - 16, 5.6, 5.6), mood === 'permission' ? 'var(--cr-alert)' : base);
				break;
			case 'sprout':
				out += `<path d="${arc(50, ty + 2, 50, ty - 8, 50.6, ty - 3)}" ${outline}/>`;
				for (const side of [-1, 1]) out += piece(petal(50, ty - 7, 50 + side * 16, ty - 15, 3.4), LEAF);
				break;
			case 'leaf':
				out += piece(petal(50, ty + 2, 65, ty - 18, 5), LEAF);
				if (detail) out += `<path d="${arc(53, ty - 2, 61, ty - 13, 56, ty - 8)}" fill="none" stroke="var(--cr-edge)" stroke-width="1.6" stroke-linecap="round"/>`;
				break;
			case 'tuft':
				for (const [x, y] of [[-11, -9], [2, -15], [13, -8]]) {
					out += `<path d="${arc(50 + x * 0.2, ty + 2, 50 + x, ty + y, 50 + x * 0.2, ty + y * 0.8)}" ${outline}/>`;
				}
				break;
		}
	}

	// The body: a flat pastel fill, a watercolour edge, a mark, pink cheeks, and a hand-drawn double outline.
	let inner = '';
	if (detail) {
		inner += `<path d="${shape}" fill="none" stroke="${deep}" stroke-opacity=".26" stroke-width="9"/>`;
		const wash = `fill="${deep}" fill-opacity=".55"`;
		if (l.mark === 'spots') for (const [x, y, r] of [[67, 12, 4.4], [75, 20, 2.9], [60, 7, 2.6]]) inner += `<path d="${oval(x, ty + y, r, r * 0.9)}" ${wash}/>`;
		if (l.mark === 'belly') inner += `<path d="${oval(50, eyeY + 30, 19, 14)}" fill="#fff" fill-opacity=".5"/>`;
		if (l.mark === 'stripes')
			for (const [x, len] of [[-9, 9], [0, 12], [9, 9]])
				inner += `<path d="${arc(50 + x, ty, 50 + x * 0.9, ty + len, 50 + x, ty + 5)}" fill="none" stroke="${deep}" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>`;
	}
	for (const side of [-1, 1]) {
		const x = 50 + side * (l.eyeGap + 8.5);
		inner += `<path d="${oval(x, eyeY + 6.5, l.cheek, l.cheek * 0.92)}" fill="${BLUSH}" fill-opacity=".92"/>`;
		if (detail && l.extra === 'freckles')
			for (const [dx, dy] of [[-2.4, -0.6], [0.4, 1.4], [2.6, -1]]) inner += `<path d="${oval(x + dx, eyeY + 6.5 + dy, 0.8, 0.8)}" fill="${INK}" fill-opacity=".75"/>`;
	}
	out +=
		`<clipPath id="${id}c"><path d="${shape}"/></clipPath>` +
		`<path d="${shape}" fill="${base}"/><g clip-path="url(#${id}c)">${inner}</g>` +
		`<path d="${shape}" ${outline}/>` +
		`<path d="${shape}" transform="translate(50 59) rotate(1.72) scale(1.02 .985) translate(-50 -59)" fill="none" stroke="var(--cr-edge)" stroke-width="${n(width * 0.55)}" stroke-linecap="round" stroke-linejoin="round"/>`;

	// The face. Where the eyes look: down at the work, up at the dots, or at you.
	const look = mood === 'working' ? [0, 2.2] : mood === 'waiting' ? [1.6, -1.8] : [0, 0];
	const rx = (detail ? 3.5 : 4.2) * l.eyeSize;
	const ry = (detail ? 4.2 : 4.8) * l.eyeSize;
	let eyes = '';
	let blinks = '';
	for (const side of [-1, 1]) {
		const x = 50 + side * l.eyeGap + look[0];
		const y = eyeY + look[1];
		switch (mood) {
			case 'asleep':
				eyes += `<path d="${arc(x - 4.8, eyeY - 0.5, x + 4.8, eyeY - 0.5, x, eyeY + 4.5)}" ${inkLine}/>`;
				break;
			case 'shipped':
				eyes += `<path d="${arc(x - 5, eyeY + 2, x + 5, eyeY + 2, x, eyeY - 7)}" ${inkLine}/>`;
				break;
			case 'waking':
				eyes += `<path d="${oval(x, y + 1, rx + 0.6, ry * 0.45)}" fill="${INK}"/>`;
				break;
			case 'permission':
				eyes +=
					`<path d="${oval(x, y - 0.5, 5.6, 6)}" fill="#fff" stroke="${INK}" stroke-width="${detail ? 2 : 2.6}"/>` +
					`<path d="${oval(x, y - 0.5, detail ? 2.2 : 2.6, detail ? 2.4 : 2.8)}" fill="${INK}"/>` +
					(detail ? `<path d="${arc(x - 4.5, y - 10.5, x + 4.5, y - 10.5, x, y - 13)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>` : '');
				break;
			default:
				eyes += `<path d="${oval(x, y, rx, ry)}" fill="${INK}"/>`;
				blinks += `<path d="${arc(x - 4, y, x + 4, y, x, y + 1.5)}" ${inkLine}/>`;
		}
	}
	const blinking = animated && blinks !== '';
	out += blinking ? `<g class="cr-open">${eyes}</g><g class="cr-shut">${blinks}</g>` : eyes;

	const my = eyeY + 8;
	const smile = (k: number) => {
		let s = '';
		if (l.smile === 'curve') s = `<path d="${arc(50 - 5 * k, my, 50 + 5 * k, my, 50, my + 8 * k)}" ${inkLine}/>`;
		if (l.smile === 'wide') s = `<path d="${arc(50 - 7 * k, my + 0.5, 50 + 7 * k, my + 0.5, 50, my + 6.5 * k)}" ${inkLine}/>`;
		if (l.smile === 'cat')
			for (const side of [-1, 1]) s += `<path d="${arc(50, my + 0.5, 50 + side * 6 * k, my + 0.5, 50 + side * 3 * k, my + 6.5 * k)}" ${inkLine}/>`;
		if (detail && l.extra === 'tooth' && k >= 1)
			s += `<rect x="48.2" y="${n(my + 2.6 * k)}" width="3.6" height="3.8" rx="1" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
		return s;
	};
	if (mood === 'yours') out += smile(1);
	if (mood === 'shipped') out += smile(1.15);
	if (mood === 'working' || mood === 'waking') out += smile(0.68);
	if (mood === 'permission') out += `<path d="${oval(50, my + 3, 2.6, 3.2)}" fill="${INK}"/>`;
	if (mood === 'waiting') out += `<path d="${arc(46, my + 2.2, 54, my + 2, 50, my + 1.6)}" ${inkLine}/>`;
	if (mood === 'asleep') out += `<path d="${oval(50, my + 2.5, 2.2, 1.9)}" fill="${INK}"/>`;

	// What sits around the creature: z's, the call strokes, the party hat, the "!" or the dots.
	let extras = '';
	if (mood === 'asleep') {
		for (const [shift, s] of [[0, 11], [0.5, 7]]) {
			// A still shows each z partway up, as the app's still does. A moving z starts at the
			// bottom of its path (85, 24) and the animation (app.css, .cr-z) carries it up and out.
			const phase = animated ? 0 : 0.25 + shift * 0.9;
			const x = 85 + phase * 8;
			const y = 24 - phase * 17;
			const z = `M${n(x - s / 2)} ${n(y - s / 2)}L${n(x + s / 2)} ${n(y - s / 2)}L${n(x - s / 2)} ${n(y + s / 2)}L${n(x + s / 2)} ${n(y + s / 2)}`;
			extras += `<path class="${animated ? (shift ? 'cr-z cr-z2' : 'cr-z') : ''}" d="${z}" fill="none" stroke="var(--cr-pen)" stroke-opacity="${n(1 - phase)}" stroke-width="${n(s * 0.27)}" stroke-linecap="round" stroke-linejoin="round"/>`;
		}
	}
	if (mood === 'yours' && detail)
		for (const [x1, y1, x2, y2] of [[79, 14, 81.5, 8], [85, 18.5, 90.5, 14.5], [87, 25, 93, 26]])
			extras += `<path d="${arc(x1, y1, x2, y2, (x1 + x2) / 2, (y1 + y2) / 2)}" fill="none" stroke="${tone(0.62, 0.96)}" stroke-width="2.8" stroke-linecap="round"/>`;
	if (mood === 'shipped') {
		const hat = `M37 ${ty + 6}L51 ${ty - 19}L65 ${ty + 6}Z`;
		extras += `<path d="${hat}" fill="${hsb(0.13, 0.5, 1)}"/>`;
		if (detail) {
			extras += `<clipPath id="${id}h"><path d="${hat}"/></clipPath><g clip-path="url(#${id}h)">`;
			for (const y of [-9, 0]) extras += `<path d="${arc(34, ty + y + 2, 68, ty + y - 6, 51, ty + y + 2)}" fill="none" stroke="${BLUSH}" stroke-width="3.4"/>`;
			extras += `</g>`;
			for (const [x, y, dx, hue] of [[13, 25, 2.5, 0.92], [88, 17, -2.5, 0.55], [80, 30, 2.5, 0.13], [23, 10, -2, 0.45]])
				extras += `<path d="${arc(x, y, x + dx, y + 3.5, x + dx / 2, y + 1.75)}" fill="none" stroke="${hsb(hue, 0.55, 0.95)}" stroke-width="2.6" stroke-linecap="round"/>`;
		}
		extras += `<path d="${hat}" ${outline}/>` + piece(oval(51, ty - 20, 4.6, 4.6), BLUSH);
	}
	if (mood === 'permission')
		extras += `<path d="${roundRect(86, 4.5, 9, 20, 4.5)}${oval(90.5, 32.5, 4.5, 4.5)}" fill="var(--cr-alert)" stroke="var(--cr-edge)" stroke-width="${detail ? 2.2 : 1.8}" stroke-linejoin="round"/>`;
	if (mood === 'waiting') for (let i = 0; i < 3; i++) extras += `<path d="${oval(76 + i * 8.5, 13, 3, 3)}" fill="var(--cr-pen)"/>`;

	const motion = animated ? ({ working: 'cr-bob', yours: 'cr-hop', asleep: 'cr-breathe' } as Record<string, string>)[mood] ?? '' : '';
	// The paper of the app's shader (CritterShaders.swift): a line that is not quite even, and a soft
	// grain in the paint. As in the app, only from 20 points up.
	const seed = Math.round(l.hue * 100 + l.eyeGap);
	const paper =
		size >= 20
			? `<filter id="${id}p" x="-8%" y="-8%" width="116%" height="116%">` +
				`<feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="2" seed="${seed}" result="wob"/>` +
				`<feDisplacementMap in="SourceGraphic" in2="wob" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="drawn"/>` +
				`<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}" result="grain"/>` +
				`<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 .62" result="specks"/>` +
				`<feComposite in="specks" in2="drawn" operator="in" result="paperspecks"/>` +
				`<feMerge><feMergeNode in="drawn"/><feMergeNode in="paperspecks"/></feMerge></filter>`
			: '';
	return (
		`<svg class="critter" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" style="--cr-edge-dark:${edgeDark}">` +
		paper +
		`<g${paper ? ` filter="url(#${id}p)"` : ''}><g class="${motion}">${out}</g>${extras}</g></svg>`
	);
}
