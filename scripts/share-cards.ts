/**
 * Renders the share cards (src/lib/share.ts) to static/share/<slug>.png, 1200 by 630.
 * Run it after a change to a page's title or summary, and commit the PNGs:
 *
 *   npm run share-cards
 *
 * It renders in Playwright's Chromium, with the site's fonts.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { card, type Card } from '../src/lib/share';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function frontMatter(source: string): Record<string, string> {
	const match = /^---\n([\s\S]*?)\n---/.exec(source);
	const data: Record<string, string> = {};
	for (const line of match?.[1].split('\n') ?? []) {
		const at = line.indexOf(':');
		if (at > 0) data[line.slice(0, at).trim()] = line.slice(at + 1).trim();
	}
	return data;
}

export const cards: Card[] = [
	{
		slug: 'home',
		kicker: 'A Mac app for Claude Code',
		title: 'Spec-driven development, in one calm window.',
		summary: 'Write a spec with Claude. Spec Studio moves it through five stages, with a clear approval gate at each one.'
	},
	{
		slug: 'guides',
		kicker: 'Guides',
		title: 'How to use Spec Studio',
		summary: 'Get started, the app, the relay and its backends.'
	},
	...readdirSync(join(root, 'src/guides'))
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const data = frontMatter(readFileSync(join(root, 'src/guides', file), 'utf8'));
			return { slug: file.replace(/\.md$/, ''), kicker: 'Guide', title: data.title, summary: data.summary };
		})
];

const fonts = ['@fontsource-variable/source-serif-4/opsz.css', '@fontsource/ibm-plex-mono/400.css']
	.map((css) => `<link rel="stylesheet" href="${pathToFileURL(require.resolve(css)).href}">`)
	.join('');

const out = join(root, 'static/share');
const work = join(root, 'test-out/share');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const c of cards) {
	const html = join(work, `${c.slug}.html`);
	writeFileSync(html, `<!doctype html><meta charset="utf-8">${fonts}<style>html,body{margin:0}</style>${card(c)}`);
	await page.goto(pathToFileURL(html).href);
	await page.evaluate(() => document.fonts.ready);
	await page.locator('svg').first().screenshot({ path: join(out, `${c.slug}.png`) });
	console.log(`static/share/${c.slug}.png  ${c.title}`);
}
await browser.close();
