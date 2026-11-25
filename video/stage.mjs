// Shared by the two video projects (project.mjs, relay/project.mjs): the local
// servers and the helpers that open video/stage.html.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const stage = 'http://127.0.0.1:4210/video/stage.html';
const servers = [];

export function serve(dir, port) {
  servers.push(spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '-d', dir], { stdio: 'ignore' }));
}
export function stopServers() {
  for (const server of servers) server.kill();
}

/** Opens a stage page off camera and waits until its clip, stills or terminal are ready. */
export async function show({ cut, page }, query) {
  await cut(`${stage}?${query}`);
  await page.evaluate(() => window.ready());
}

/** The length of a scene's narration window, in seconds: from the voice to the scene's end. */
export function spoken(plan, name) {
  const p = plan.segments[name];
  return p.end - p.narration;
}
