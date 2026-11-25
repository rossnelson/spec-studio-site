// Writes WebVTT captions from the narration of a project and the times in its
// build/plan.json and build/durations.json (after `bin/demo build`).
// Each sentence gets a share of its clip's time by its length.
//
//   node captions.mjs <project folder> <out.vtt>     (the folder: . or relay)
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '.');
const out = process.argv[3];
if (!out) throw new Error('usage: node captions.mjs <project folder> <out.vtt>');
const { default: project } = await import(pathToFileURL(`${dir}/project.mjs`).href);
const plan = JSON.parse(readFileSync(`${dir}/build/plan.json`, 'utf8'));
const durations = Object.fromEntries(JSON.parse(readFileSync(`${dir}/build/durations.json`, 'utf8')));

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
