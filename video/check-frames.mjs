// Checks a built video for blank paper, and makes a contact sheet of it
// (after `bin/demo build`, before publish.sh).
//
//   node check-frames.mjs <project folder>     (the folder: . or relay)
//
// The contact sheet: build/contact-sheet.png (and .html), one frame for each
// second of build/<name>.mp4, tiled, with the time under each frame. Look at
// every frame of it before you publish.
//
// The check fails when a stretch of FAIL_SECONDS or more is flat (plain paper
// or one flat color), except inside the intro, outro and end cards, which are
// cards on purpose. A frame is flat when fewer than FLAT_SHARE of the pixels of
// a small copy differ from the frame's median color by more than FLAT_DIFF.
//
// Exit codes: 0 pass, 3 a flat stretch (the video fails), 1 the check could not run.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const FAIL_SECONDS = 3; // the longest flat stretch that passes is just under this
const CHECK_FPS = 2;    // frames each second that the check reads
const FLAT_DIFF = 24;   // a pixel this far (0-255, on any channel) from the median is content
const FLAT_SHARE = 0.005; // a frame with fewer content pixels than this share is flat
const W = 160, H = 90;  // the small copy the check reads
const SKIP = new Set(['intro', 'outro', 'end']);

const dir = resolve(process.argv[2] ?? '.');
const { default: project } = await import(pathToFileURL(`${dir}/project.mjs`).href);
const build = `${dir}/build`;
const plan = JSON.parse(readFileSync(`${build}/plan.json`, 'utf8'));
const video = `${build}/${project.name}.mp4`;
// No sheet from an earlier build: a crash below leaves no sheet at all.
rmSync(`${build}/contact-sheet.png`, { force: true });
rmSync(`${build}/contact-sheet.html`, { force: true });

const ffmpeg = (args, opts = {}) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', ...args], { maxBuffer: 1 << 30, ...opts });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
  return r.stdout;
};
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// The spans of the cards that are on purpose: the intro, the outro and the end
// card. The video opens on the first scene's card, and the end card holds to
// the last frame of the video.
const skipped = project.scenes
  .filter((s) => SKIP.has(s.kind) && plan.segments[s.name])
  .map((s) => ({ name: s.name, start: s === project.scenes[0] ? 0 : plan.segments[s.name].start, end: s.kind === 'end' ? Infinity : plan.segments[s.name].end }));
const inSkipped = (t) => skipped.some((s) => t >= s.start && t < s.end);

// 1. Is each frame flat?
const raw = ffmpeg(['-i', video, '-vf', `fps=${CHECK_FPS},scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const size = W * H * 3;
const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];
const frames = [];
for (let off = 0, i = 0; off + size <= raw.length; off += size, i++) {
  const px = raw.subarray(off, off + size);
  const ch = [0, 1, 2].map((c) => median(Array.from({ length: W * H }, (_, p) => px[p * 3 + c])));
  let content = 0;
  for (let p = 0; p < W * H; p++) {
    const d = Math.max(Math.abs(px[p * 3] - ch[0]), Math.abs(px[p * 3 + 1] - ch[1]), Math.abs(px[p * 3 + 2] - ch[2]));
    if (d > FLAT_DIFF) content++;
  }
  // ffmpeg's fps filter takes the frame nearest each tick: frame i is at i / CHECK_FPS.
  frames.push({ t: i / CHECK_FPS, flat: content / (W * H) < FLAT_SHARE, color: `rgb(${ch.join(',')})` });
}
if (!frames.length) throw new Error(`no frames read from ${video}`);
const duration = frames.length / CHECK_FPS;

// 2. Stretches of flat frames outside the skipped cards.
const stretches = [];
let run = null;
for (const f of frames) {
  const bad = f.flat && !inSkipped(f.t);
  if (bad && !run) run = { start: f.t, end: f.t + 1 / CHECK_FPS, color: f.color };
  else if (bad) run.end = f.t + 1 / CHECK_FPS;
  else if (run) { stretches.push(run); run = null; }
}
if (run) stretches.push(run);
const failures = stretches.filter((s) => s.end - s.start >= FAIL_SECONDS);

// 3. The contact sheet: 1 frame each second, with its time.
const tiles = `${build}/contact`;
rmSync(tiles, { recursive: true, force: true });
mkdirSync(tiles, { recursive: true });
ffmpeg(['-i', video, '-vf', 'fps=1,scale=320:180', '-q:v', '4', `${tiles}/%04d.jpg`]);
const files = readdirSync(tiles).filter((f) => f.endsWith('.jpg')).sort();
// With fps=1, tile n (from 1) is the frame nearest second n - 1.
const flatAt = (t) => frames.find((f) => Math.abs(f.t - t) < 1e-6)?.flat;
const html = `<!doctype html><meta charset="utf-8"><title>${project.name}: contact sheet</title>
<style>
body{margin:0;padding:16px;background:#222;color:#eee;font:14px/1.3 Menlo,monospace}
h1{font-size:16px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(10,320px);gap:8px}
figure{margin:0}
img{display:block;width:320px;height:180px;outline:3px solid transparent;outline-offset:-3px}
.flat img{outline-color:#e0b000}.bad img{outline-color:#e03030}
figcaption{padding:2px 0}
</style>
<h1>${project.name}: ${files.length} s, ${failures.length ? `FAIL: ${failures.map((s) => `${clock(s.start)}-${clock(s.end)}`).join(', ')}` : 'pass'}. Yellow: a flat frame; red: inside a failing stretch.</h1>
<div class="grid">${files.map((f, i) => {
  const bad = failures.some((s) => i >= s.start && i < s.end);
  const cls = bad ? 'bad' : flatAt(i) ? 'flat' : '';
  return `<figure class="${cls}"><img src="contact/${f}"><figcaption>${clock(i)}${inSkipped(i) ? ' card' : ''}</figcaption></figure>`;
}).join('')}</div>`;
writeFileSync(`${build}/contact-sheet.html`, html);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 10 * 320 + 9 * 8 + 32, height: 400 } });
  await page.goto(pathToFileURL(`${build}/contact-sheet.html`).href);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.screenshot({ path: `${build}/contact-sheet.png`, fullPage: true });
} finally {
  await browser.close();
}

console.log(`${project.name}: ${duration.toFixed(1)} s, contact sheet ${build}/contact-sheet.png`);
console.log(`skipped (cards on purpose): ${skipped.map((s) => `${s.name} ${clock(s.start)}-${s.end === Infinity ? 'end' : clock(s.end)}`).join(', ')}`);
for (const s of stretches) console.log(`  flat ${clock(s.start)}-${clock(s.end)} (${(s.end - s.start).toFixed(1)} s, ${s.color})`);
if (failures.length) {
  for (const s of failures) console.error(`FAIL: ${(s.end - s.start).toFixed(1)} s of plain ${s.color} from ${clock(s.start)} to ${clock(s.end)}`);
  process.exit(3);
}
console.log(`pass: no flat stretch of ${FAIL_SECONDS} s or more`);
