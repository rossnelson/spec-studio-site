import { expect, test } from '@playwright/test';

// R7: each replica scales to the column as a whole, in Chromium and in WebKit (Safari), on a desktop and a phone.
for (const width of [1280, 390]) {
	test(`every replica fits its box at ${width} px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		for (const slug of ['get-started', 'app', 'relay']) {
			await page.goto(`./guides/${slug}/`);
			for (const proto of await page.locator('.proto').all()) {
				const [box, drawn] = await proto.evaluate((el) => [el.getBoundingClientRect(), el.querySelector('.rp')!.getBoundingClientRect()].map((r) => ({ w: r.width, h: r.height })));
				const name = await proto.getAttribute('data-proto');
				expect(Math.abs(drawn.w - box.w), `${slug} ${name} width`).toBeLessThan(2);
				expect(Math.abs(drawn.h - box.h), `${slug} ${name} height`).toBeLessThan(2);
			}
		}
	});
}
