import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// R9: every page has a share card, and the tags that link previews read.
const pages = [
	['./', 'home'],
	['./guides/', 'guides'],
	['./guides/get-started/', 'get-started'],
	['./guides/app/', 'app'],
	['./guides/relay/', 'relay'],
	['./guides/backends/', 'backends'],
	['./guides/backend-plugins/', 'backend-plugins']
];

/** Width and height of a PNG, from its IHDR chunk. */
function pngSize(file: string): [number, number] {
	const data = readFileSync(file);
	return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

for (const [path, slug] of pages) {
	test(`${path} has its share card and the link preview tags`, async ({ page, request }) => {
		await page.goto(path);
		const meta = (name: string) => page.locator(`meta[property="${name}"], meta[name="${name}"]`).getAttribute('content');
		expect(await meta('og:image')).toBe(`https://spec-studio-app.github.io/site/share/${slug}.png`);
		expect(await meta('twitter:card')).toBe('summary_large_image');
		expect(await meta('og:title')).toBeTruthy();
		expect((await meta('og:description'))!.length).toBeGreaterThan(20);
		expect(await meta('og:url')).toMatch(/^https:\/\/spec-studio-app\.github\.io\/site\//);
		// The card is in the build, at the path that the absolute URL names.
		expect((await request.get(`./share/${slug}.png`)).ok()).toBe(true);
		expect(pngSize(new URL(`../static/share/${slug}.png`, import.meta.url).pathname)).toEqual([1200, 630]);
	});
}
