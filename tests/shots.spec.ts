import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';

// The stills of areas and projects (specs/areas-and-projects-media/spec.md).
// src/lib/shots.ts is not imported here: it needs SvelteKit's $app/paths.
const names = ['areas-sidebar', 'project-view'];

/** The stills in the "Areas and projects" section: between its h2 and the next h2. */
async function sectionShots(page: Page) {
	return page.getByTestId('guide').evaluate((root) => {
		const found: { name: string; alt: string; loading: string; src: string; width: number; caption: string }[] = [];
		let inSection = false;
		for (const el of Array.from(root.querySelectorAll('h2, figure.shot'))) {
			if (el.tagName === 'H2') inSection = el.id === 'areas-and-projects';
			else if (inSection) {
				const img = el.querySelector('img')!;
				found.push({
					name: el.getAttribute('data-shot')!,
					alt: img.alt,
					loading: img.loading,
					src: img.currentSrc,
					width: img.naturalWidth,
					caption: el.querySelector('figcaption')?.textContent ?? ''
				});
			}
		}
		return found;
	});
}

/** Scrolls each still into view, so the lazy images load. */
async function loadAll(page: Page) {
	for (const shot of await page.getByTestId('shot').all()) {
		await shot.scrollIntoViewIfNeeded();
		await expect.poll(() => shot.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
	}
}

// R1.S5
test('each still of the guide has a light and a dark file', () => {
	for (const name of names) {
		for (const file of [`${name}.webp`, `${name}-dark.webp`]) {
			expect(existsSync(new URL(`../static/shots/${file}`, import.meta.url)), file).toBe(true);
		}
	}
	for (const name of [...names, 'areas-folded']) {
		expect(existsSync(new URL(`../video/stills/${name}.webp`, import.meta.url)), name).toBe(true);
	}
});

// R2.S1 and R2.S3
test('the Areas and projects section shows two stills, lazily, each with an alt text and a caption', async ({ page }) => {
	await page.goto('./guides/app/');
	await loadAll(page);
	const shots = await sectionShots(page);
	expect(shots.map((s) => s.name)).toEqual(names);
	for (const shot of shots) {
		expect(shot.alt.length, shot.name).toBeGreaterThan(20);
		expect(shot.caption.length, shot.name).toBeGreaterThan(20);
		expect(shot.loading, shot.name).toBe('lazy');
		expect(shot.width, shot.name).toBeGreaterThan(0);
	}
});

// R2.S2: the browser picks the still from the system setting, with no JavaScript.
for (const scheme of ['light', 'dark'] as const) {
	test.describe(`in the ${scheme} scheme with JavaScript off`, () => {
		test.use({ colorScheme: scheme, javaScriptEnabled: false });
		test(`the stills are the ${scheme} versions`, async ({ page }) => {
			await page.goto('./guides/app/');
			for (const shot of await page.getByTestId('shot').all()) {
				await shot.scrollIntoViewIfNeeded();
				const img = shot.locator('img');
				await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\.webp$/);
				const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
				expect(src.endsWith('-dark.webp')).toBe(scheme === 'dark');
			}
		});
	});
}

// R2.S3
test.describe('on a 375 px phone', () => {
	test.use({ viewport: { width: 375, height: 812 } });
	test('the app guide with its stills has no horizontal scroll', async ({ page }) => {
		await page.goto('./guides/app/');
		await loadAll(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
	});
	// The sidebar still is a crop of the sidebar, so it shows at least at half
	// of its 2× pixels: its text stays as large as in the app.
	test('the sidebar still is at least half its pixel width', async ({ page }) => {
		await page.goto('./guides/app/');
		const img = page.locator('[data-shot="areas-sidebar"] img');
		await img.scrollIntoViewIfNeeded();
		expect((await img.boundingBox())!.width).toBeGreaterThanOrEqual(520 / 2);
	});
});
