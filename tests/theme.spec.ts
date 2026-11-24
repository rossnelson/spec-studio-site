import { expect, test, type Page } from '@playwright/test';

const paper = { light: 'rgb(246, 241, 230)', dark: 'rgb(26, 25, 23)' };

for (const scheme of ['light', 'dark'] as const) {
	test.describe(`${scheme} system setting`, () => {
		test.use({ colorScheme: scheme });

		// R9.S1 and R9.S2. With JavaScript off, only the CSS in the prerendered
		// page can set the theme, so this is what the first paint shows.
		test.describe('with JavaScript off', () => {
			test.use({ javaScriptEnabled: false });

			test(`the first paint has the ${scheme} paper`, async ({ page }) => {
				await page.goto('./');
				const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
				expect(background).toBe(paper[scheme]);
			});
		});

		// R9.S3
		test(`every sketch loads its ${scheme} version`, async ({ page }) => {
			await page.goto('./');
			const sketches = page.locator('img[data-sketch]');
			await expect(sketches).toHaveCount(7);
			for (const img of await sketches.all()) {
				await img.scrollIntoViewIfNeeded();
				await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
				const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
				if (scheme === 'dark') expect(src).toMatch(/-dark\.(webp|png)$/);
				else expect(src).not.toMatch(/-dark\./);
			}
		});

		// R9.S4, on a desktop and on a phone.
		for (const width of [1440, 390]) {
			test(`every text has enough contrast in the ${scheme} theme at ${width} px`, async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.goto('./');
				const failures = await contrastFailures(page);
				expect(failures).toEqual([]);
			});
		}

		// R2.S2: a screenshot of each theme, to compare with its concept.
		test(`${scheme} screenshot for the concept comparison`, async ({ page }, info) => {
			await page.goto('./');
			await page.evaluate(() => document.fonts.ready);
			for (const img of await page.locator('img').all()) await img.scrollIntoViewIfNeeded();
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.screenshot({ path: info.outputPath(`desktop-1440-${scheme}.png`), fullPage: true });
		});
	});
}

/**
 * Each element with its own text, whose WCAG contrast against the page paper
 * is below 4.5:1. R9.S4 lets only large headings use 3:1: text in an h1, h2 or
 * h3 of 24 px or more (or 18.66 px bold). Body text needs 4.5:1 at every size.
 * Large decoration that screen readers skip (aria-hidden, such as the 140 px
 * stage numerals, whose order the list already gives) also gets 3:1.
 * Every section sits on the paper, so the paper is the background.
 */
async function contrastFailures(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const rgb = (value: string) => value.match(/[\d.]+/g)!.slice(0, 4).map(Number);
		const lum = ([r, g, b]: number[]) => {
			const c = [r, g, b].map((v) => {
				const s = v / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
		};
		const paper = rgb(getComputedStyle(document.body).backgroundColor);
		const failures: string[] = [];
		for (const el of document.querySelectorAll<HTMLElement>('body *')) {
			const own = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
			// The fallback inside a video element never renders.
			if (!own || el.closest('svg, video')) continue;
			const style = getComputedStyle(el);
			const [r, g, b, a = 1] = rgb(style.color);
			// Mix a transparent text color into the paper.
			const fg = [r, g, b].map((v, i) => v * a + paper[i] * (1 - a));
			const [hi, lo] = [lum(fg), lum(paper)].sort((x, y) => y - x);
			const ratio = (hi + 0.05) / (lo + 0.05);
			const size = parseFloat(style.fontSize);
			const heading = el.closest('h1, h2, h3, [aria-hidden="true"]') !== null;
			const large = heading && (size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700));
			const need = large ? 3 : 4.5;
			if (ratio < need) failures.push(`${el.tagName} "${el.textContent!.trim().slice(0, 30)}": ${ratio.toFixed(2)} < ${need}`);
		}
		return failures;
	});
}
