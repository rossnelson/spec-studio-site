import { expect, test } from '@playwright/test';

// R3.S3: before the first release.
test('with no release, the hero says Coming soon and the changelog says so', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByTestId('coming-soon')).toHaveText('Coming soon');
	await expect(page.getByText('brew install --cask spec-studio-app/tap/spec-studio')).toHaveCount(0);
	await expect(page.getByTestId('download')).toHaveCount(0);
	await expect(page.getByTestId('changelog')).toContainText('No release yet.');
});

// R2.S2: the Get started guide follows the launch page before the first release.
test('with no release, Get started says Coming soon in place of the install command', async ({ page }) => {
	await page.goto('./guides/get-started/');
	await expect(page.getByTestId('install-soon')).toContainText('Coming soon');
	await expect(page.getByText('brew install --cask spec-studio-app/tap/spec-studio')).toHaveCount(0);
	await expect(page.getByTestId('guide').getByText(/Homebrew|\.dmg/)).toHaveCount(0);
});
