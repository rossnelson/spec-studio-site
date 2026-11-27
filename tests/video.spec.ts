import { readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// R6.S2: the video plays from the site, with a poster and captions. The app
// video is on the launch page and the guides; the relay video is on the relay guide.
for (const path of ['./', './guides/', './guides/relay/']) {
	test(`the video on ${path} has a poster, captions and plays`, async ({ page, request }) => {
		await page.goto(path);
		const video = page.getByTestId('video').locator('video');
		await expect(video).toHaveCount(1);
		const poster = await video.evaluate((el: HTMLVideoElement) => el.poster);
		expect((await request.get(poster)).ok()).toBe(true);
		const track = video.locator('track[kind="captions"]');
		await expect(track).toHaveCount(1);
		const vtt = await request.get(await track.evaluate((el: HTMLTrackElement) => el.src));
		expect(vtt.ok()).toBe(true);
		expect(await vtt.text()).toMatch(/^WEBVTT/);
		// Captions are off until the visitor turns them on.
		expect(await track.getAttribute('default')).toBeNull();
		await video.evaluate(async (el: HTMLVideoElement) => {
			el.muted = true;
			await el.play();
		});
		await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime), { timeout: 10_000 }).toBeGreaterThan(0.5);
	});
}

// R6.S3: no request for the MP4 before play, and the file is at most 40 MB.
test('the launch page loads no video file until play', async ({ page }) => {
	const mp4: string[] = [];
	page.on('request', (r) => {
		if (r.url().endsWith('.mp4')) mp4.push(r.url());
	});
	await page.goto('./');
	await page.waitForLoadState('networkidle');
	await page.getByTestId('video').scrollIntoViewIfNeeded();
	await page.waitForTimeout(500);
	expect(mp4).toEqual([]);
	await expect(page.getByTestId('video').locator('video')).toHaveAttribute('preload', 'none');
});

for (const file of ['spec-studio', 'spec-studio-relay']) {
	test(`the video file ${file}.mp4 is 40 MB or smaller`, () => {
		const size = statSync(new URL(`../static/video/${file}.mp4`, import.meta.url)).size;
		expect(size).toBeLessThanOrEqual(40 * 1024 * 1024);
	});
}

test('the relay guide shows the relay video, and the launch page the app video', async ({ page }) => {
	await page.goto('./guides/relay/');
	await expect(page.getByTestId('video')).toHaveAttribute('data-video', 'relay');
	await page.goto('./');
	await expect(page.getByTestId('video')).toHaveAttribute('data-video', 'app');
});

// specs/areas-and-projects-media R5.S2: the size in src/lib/videos.ts is the
// file's size in MB (1024 × 1024 bytes), rounded. videos.ts needs SvelteKit's
// $app/paths, so the test reads it as text.
const videosSource = readFileSync(new URL('../src/lib/videos.ts', import.meta.url), 'utf8');
for (const [name, file] of [['app', 'spec-studio'], ['relay', 'spec-studio-relay']]) {
	test(`the size of the ${name} video in videos.ts matches ${file}.mp4`, () => {
		const entry = new RegExp(`${name}: \\{[^}]*file: '${file}'[^}]*size: '(\\d+) MB'`).exec(videosSource);
		expect(entry, name).not.toBeNull();
		const size = statSync(new URL(`../static/video/${file}.mp4`, import.meta.url)).size;
		expect(Number(entry![1])).toBe(Math.round(size / 1024 / 1024));
	});
}

test('the caption of the app video names areas and projects', () => {
	const caption = /app: \{[^}]*caption: '([^']*)'/.exec(videosSource)![1];
	expect(caption).toMatch(/areas and projects/i);
});
