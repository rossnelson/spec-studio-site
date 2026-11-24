import { statSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// R6.S2: the video plays from the site, with a poster and captions.
for (const path of ['./', './guides/']) {
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

test('the video file is 40 MB or smaller', () => {
	const size = statSync(new URL('../static/video/spec-studio.mp4', import.meta.url)).size;
	expect(size).toBeLessThanOrEqual(40 * 1024 * 1024);
});
