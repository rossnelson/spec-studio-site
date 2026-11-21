import { expect, test } from '@playwright/test';

// R6.S1: the newest release first, with its date and notes.
test('the changelog shows the releases, newest first', async ({ page }) => {
	await page.goto('./');
	const releases = page.getByTestId('release');
	await expect(releases).toHaveCount(2);
	await expect(releases.nth(0)).toHaveText(/0\.2\.0\s*·\s*Dec 3, 2026\s*·\s*Adds the Merge stage/);
	await expect(releases.nth(1)).toHaveText(/0\.1\.0\s*·\s*Nov 24, 2026\s*·\s*First public release/);
});

// R6.S2: the changelog needs no GitHub API call.
test('the changelog shows all releases when api.github.com is blocked', async ({ page }) => {
	const apiCalls: string[] = [];
	page.on('request', (request) => {
		if (new URL(request.url()).hostname === 'api.github.com') apiCalls.push(request.url());
	});
	await page.route('https://api.github.com/**', (route) => route.abort());
	await page.goto('./');
	await page.waitForLoadState('networkidle');
	await expect(page.getByTestId('release')).toHaveCount(2);
	expect(apiCalls).toEqual([]);
});
