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

	test('the copy result does not move the command box', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('./');
		const button = page.getByRole('button', { name: 'Copy the install command' });
		const before = await button.boundingBox();
		await button.click();
		await expect(page.getByTestId('copied')).toBeVisible();
		const after = await button.boundingBox();
		expect(after?.width).toBe(before?.width);
		expect(after?.x).toBe(before?.x);
	});

	test('the whole install command shows, with nothing cut off', async ({ page }) => {
		await page.goto('./');
		const code = page.getByText('brew install --cask rossnelson/tap/spec-studio');
		await expect(code).toBeVisible();
		const { scroll, client } = await code.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
		expect(scroll).toBeLessThanOrEqual(client);
	});
});
