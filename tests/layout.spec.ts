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
