import { expect, test, type APIRequestContext } from '@playwright/test';

// R7.S4: every link and image of the launch page and the guides works.
const pages = ['./', './guides/', './guides/get-started/', './guides/app/', './guides/relay/', './guides/backends/'];

async function status(request: APIRequestContext, url: string): Promise<number> {
	for (let attempt = 0; ; attempt++) {
		let code: number;
		try {
			const head = await request.head(url, { maxRedirects: 5, timeout: 15_000 });
			code = head.status();
			if (code === 405 || code === 403) code = (await request.get(url, { maxRedirects: 5, timeout: 15_000 })).status();
		} catch {
			code = 599;
		}
		// External sites get one retry, so a slow answer does not fail the test.
		if (code < 400 || attempt >= 1 || url.includes('127.0.0.1')) return code;
	}
}

test('no link and no image of the launch page and the guides fails', async ({ page, request }) => {
	test.setTimeout(180_000);
	const targets = new Map<string, string>();
	for (const path of pages) {
		await page.goto(path);
		const found = await page.evaluate(() => [
			...[...document.querySelectorAll('a[href]')].map((a) => (a as HTMLAnchorElement).href),
			...[...document.querySelectorAll('img[src], video[poster], source[srcset], track[src], link[rel~="icon"]')].map(
				(el) =>
					(el as HTMLImageElement).src ||
					(el as HTMLVideoElement).poster ||
					(el as HTMLTrackElement).src ||
					(el as HTMLLinkElement).href ||
					new URL((el as HTMLSourceElement).srcset.split(' ')[0], location.href).href
			)
		]);
		for (const url of found) {
			const clean = url.split('#')[0];
			if (clean && !clean.startsWith('mailto:') && !targets.has(clean)) targets.set(clean, path);
		}
	}
	const broken: string[] = [];
	for (const [url, from] of targets) {
		// A download of a release that the test fixture made up does not exist.
		if (url.includes('/releases/download/')) continue;
		const code = await status(request, url);
		if (code >= 400) broken.push(`${code} ${url} (on ${from})`);
	}
	expect(broken).toEqual([]);
});
