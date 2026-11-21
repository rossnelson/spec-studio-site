import { expect, test } from '@playwright/test';

// R3.S3: before the first release.
test('with no release, the hero says Coming soon and the changelog says so', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByTestId('coming-soon')).toHaveText('Coming soon');
	await expect(page.getByText('brew install --cask rossnelson/tap/spec-studio')).toHaveCount(0);
	await expect(page.getByTestId('download')).toHaveCount(0);
	await expect(page.getByTestId('changelog')).toContainText('No release yet.');
});
