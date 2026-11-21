import { expect, test } from '@playwright/test';

// R2.S3
test.describe('on a 390 px phone', () => {
	test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

	test('every section shows with no horizontal scroll', async ({ page }) => {
		await page.goto('./');
		for (const id of ['hero', 'requirements', 'changelog']) {
			await page.getByTestId(id).scrollIntoViewIfNeeded();
			await expect(page.getByTestId(id)).toBeVisible();
		}
		await expect(page.getByTestId('stage')).toHaveCount(5);
		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width).toBeLessThanOrEqual(390);
	});
});

// R2.S2: a full-page screenshot to compare with the approved concept by eye.
test('desktop screenshot for the concept comparison', async ({ page }, info) => {
	await page.goto('./');
	await page.evaluate(() => document.fonts.ready);
	for (const img of await page.getByRole('img').all()) await img.scrollIntoViewIfNeeded();
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.screenshot({ path: info.outputPath('desktop-1440.png'), fullPage: true });
});
