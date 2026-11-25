import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

// R1.S3 of specs/video-blank-paper: the critter theme's card (video/theme/card.js)
// gives its paper a valid animation list for each kind of card, so a card that
// follows another card still leaves.
const cardJs = fileURLToPath(new URL('../video/theme/card.js', import.meta.url));

type Card = { kind: 'transition' | 'end'; opts: Record<string, unknown> };

async function paper(page: Page, card: Card) {
	await page.setContent('<!doctype html><html><body></body></html>');
	await page.evaluate(() => {
		(window as unknown as { __demoConfig: unknown }).__demoConfig = {
			beat: 500,
			theme: { colors: { bg: '#f6f1e6', text: '#1b1c20' }, fonts: {}, options: { base: '' } }
		};
	});
	await page.addScriptTag({ path: cardJs });
	return page.evaluate(({ kind, opts }) => {
		const demo = (window as unknown as { __demo: Record<string, (...a: unknown[]) => number> }).__demo;
		if (kind === 'end') demo.end({ title: 'End' }, 1000, opts);
		else demo.transition('01', 'One window', 'A subtitle', 1000, opts);
		const el = document.getElementById('demo-transition')!.shadowRoot!.querySelector('.demo')!;
		return {
			names: el.getAnimations().map((a) => (a as CSSAnimation).animationName).sort(),
			opacity: getComputedStyle(el).opacity
		};
	}, card);
}

const cases: [string, Card, string[], string][] = [
	['a plain scene card fades in and slides out', { kind: 'transition', opts: {} }, ['demoFadeIn', 'demoPaperOut'], '0'],
	['a card after a card starts up and slides out', { kind: 'transition', opts: { afterCard: true } }, ['demoPaperOut'], '1'],
	['a kept card (intro, outro) fades in and keeps its paper', { kind: 'transition', opts: { keep: true } }, ['demoFadeIn'], '0'],
	['a kept card after a card keeps its paper', { kind: 'transition', opts: { keep: true, afterCard: true } }, [], '1'],
	['the end card fades in and keeps its paper', { kind: 'end', opts: {} }, ['demoFadeIn'], '0'],
	['the end card after the outro keeps its paper', { kind: 'end', opts: { afterCard: true } }, [], '1']
];

for (const [name, card, names, opacity] of cases) {
	test(`the video card's paper: ${name}`, async ({ page }) => {
		const got = await paper(page, card);
		expect(got.names).toEqual(names);
		// The opacity before any animation runs (demoFadeIn has no delay, so it
		// may already be on its way up; read it only when nothing fades in).
		if (!names.includes('demoFadeIn')) expect(got.opacity).toBe(opacity);
	});
}
