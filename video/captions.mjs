// Writes WebVTT captions from the narration of project.mjs and the times in
// build/plan.json and build/durations.json (after `bin/demo build`).
// Each sentence gets a share of its clip's time by its length.
import { readFileSync, writeFileSync } from 'node:fs';
import project from './project.mjs';

const out = process.argv[2] ?? new URL('../static/video/spec-studio.vtt', import.meta.url);
const plan = JSON.parse(readFileSync(new URL('./build/plan.json', import.meta.url), 'utf8'));
const durations = Object.fromEntries(JSON.parse(readFileSync(new URL('./build/durations.json', import.meta.url), 'utf8')));

const stamp = (s) => {
  const ms = Math.round(s * 1000);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}.${pad(ms % 1000, 3)}`;
};

const cues = [];
for (const scene of project.scenes) {
  if (!scene.narration) continue;
  const start = plan.segments[scene.name].narration;
  const length = durations[scene.name];
  const sentences = scene.narration.match(/[^.?!]+[.?!]+/g) ?? [scene.narration];
  const total = sentences.reduce((n, s) => n + s.length, 0);
  let t = start;
  for (const sentence of sentences) {
    const d = (length * sentence.length) / total;
    cues.push(`${stamp(t)} --> ${stamp(t + d)}\n${sentence.trim()}`);
    t += d;
  }
}
writeFileSync(out, `WEBVTT\n\n${cues.join('\n\n')}\n`);
console.log(`${cues.length} captions`);
