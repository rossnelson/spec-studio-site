import { expect, test } from '@playwright/test';

// R4.S1
test('the five stages show in order, each with a text and an illustration', async ({ page }) => {
	await page.goto('./');
	const stages = page.getByTestId('stage');
	await expect(stages).toHaveCount(5);
	const names = ['Spec', 'Plan', 'Build', 'Check', 'Merge'];
	for (const [i, name] of names.entries()) {
		const stage = stages.nth(i);
		await expect(stage.getByRole('heading', { level: 3 })).toHaveText(name);
		await expect(stage.locator('p')).not.toBeEmpty();
		const img = stage.getByRole('img');
		await img.scrollIntoViewIfNeeded();
		await expect(img).toHaveAttribute('alt', /critter/);
		await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
	}
});

// R5.S1
test('the requirements name macOS 26, Claude Code and a signed-in gh', async ({ page }) => {
	await page.goto('./');
	const requirements = page.getByTestId('requirements');
	await expect(requirements).toContainText('macOS 26 or later');
	await expect(requirements).toContainText('Claude Code');
	await expect(requirements).toContainText(/GitHub CLI \(gh\) signed in/);
});
