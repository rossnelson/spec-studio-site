import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
	projects: [
		// The site with two releases (tests/fixtures/two.json).
		{ name: 'releases', testIgnore: /empty\.spec\.ts/, use: { baseURL: 'http://127.0.0.1:4101/site/' } },
		// Safari's engine, for the replicas' scaling.
		{ name: 'webkit', testMatch: /replicas\.spec\.ts/, use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:4101/site/' } },
		// The site before the first release (tests/fixtures/empty.json).
		{ name: 'empty', testMatch: /empty\.spec\.ts/, use: { baseURL: 'http://127.0.0.1:4102/site/' } }
	],
	webServer: {
		command: './scripts/serve-tests.sh',
		url: 'http://127.0.0.1:4101/site/',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
