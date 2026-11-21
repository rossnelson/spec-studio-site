import { expect, test } from '@playwright/test';

const command = 'brew install --cask rossnelson/tap/spec-studio';

// R3.S1
test('the copy button puts the install command on the clipboard', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('./');
	await expect(page.getByText(command)).toBeVisible();
	await page.getByRole('button', { name: 'Copy the install command' }).click();
	await expect(page.getByTestId('copied')).toHaveText('Copied');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
});

// R3.S2
test('the download button links to the .dmg of the latest release', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByTestId('download')).toHaveAttribute(
		'href',
		'https://github.com/rossnelson/spec-studio-site/releases/download/v0.2.0/Spec-Studio-0.2.0.dmg'
	);
	await expect(page.getByTestId('coming-soon')).toHaveCount(0);
});
