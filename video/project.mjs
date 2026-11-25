// The Spec Studio demo video. Build it with demo-video-tool:
//
//   npm run build                                  # the site, for the backends scene (build/)
//   MUSIC=<bed.mp3> <demo-video-tool>/bin/demo all video
//
// video/README.md says how the clips in video/clips/ were made.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const site = fileURLToPath(new URL('../build', import.meta.url));
// GitHub Pages serves the site under /site/, so the local server does too.
const siteRoot = fileURLToPath(new URL('./build/serve', import.meta.url));
const stage = 'http://127.0.0.1:4210/video/stage.html';
const guide = 'http://127.0.0.1:4211/site/guides/backends/';
const servers = [];

function serve(dir, port) {
  servers.push(spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '-d', dir], { stdio: 'ignore' }));
}

/** Opens a stage page off camera and waits until its clip, still or terminal is ready. */
async function show({ cut, page }, query) {
  await cut(`${stage}?${query}`);
  await page.evaluate(() => window.ready());
}

export default {
  name: 'spec-studio',
  title: 'Spec Studio',
  subtitle: 'Spec-driven development with Claude Code',
  url: 'spec-studio-app.github.io/site',
  keys: [],
  theme: 'paper',
  music: { path: process.env.MUSIC ?? null },
  browser: { profile: null, headless: true, viewport: { width: 1920, height: 1080 } },
  video: { background: '#16161e' },
  timing: { cardBeats: 6, holdBeats: 4 },

  async setup({ settle }) {
    rmSync(siteRoot, { recursive: true, force: true });
    mkdirSync(siteRoot, { recursive: true });
    symlinkSync(site, `${siteRoot}/site`);
    serve(root, 4210);
    serve(siteRoot, 4211);
    await new Promise((r) => setTimeout(r, 800));
    await settle(`${stage}?still=stills/first-open-dark.webp`);
  },
  async teardown() {
    for (const server of servers) server.kill();
  },

  scenes: [
    {
      name: '00-intro', kind: 'intro',
      narration: 'Spec Studio is a Mac app for spec-driven development with Claude Code. You describe a change, and one Claude session takes it from a spec to reviewed pull requests.',
    },
    {
      name: '01-describe', step: '01', title: 'Describe the change', subtitle: 'A title and a few sentences',
      narration: 'Make a spec in any repo. Give it a title and say what a user sees when it is done. In Autopilot, Claude writes the spec and the plan, builds the change and opens a draft pull request, with no question in between.',
      before: (api) => show(api, 'still=stills/new-spec.webp'),
    },
    {
      name: '02-stages', step: '02', title: 'Five stages', subtitle: 'Spec, Plan, Build, Check, Merge',
      narration: 'Every spec moves through five stages. The reader shows each document while Claude writes it: the spec with its scenarios, the plan, the build with its pull request, and the review. The strip at the top says whose turn it is.',
      before: (api) => show(api, 'clip=stages'),
      async run({ page }) { await page.evaluate(() => window.play(1)); },
    },
    {
      name: '03-review', step: '03', title: 'A review before yours', subtitle: 'Parallel finders, a two of three vote',
      narration: 'In Check, a self review reads the pull request with parallel finders, and three verifiers vote on each finding. Here it found two problems. Claude fixed both, and a second round found nothing. Then it is over to you.',
      before: (api) => show(api, 'still=stills/review-dark.webp'),
    },
    {
      name: '04-relay-ask', step: '04', title: 'Away from the Mac', subtitle: 'The relay, a remote MCP server you host',
      narration: 'Away from the Mac? The relay is a remote MCP server that you host. Claude AI, or Claude Code on another computer, can list your specs, read them, and send a spec a message.',
      before: (api) => show(api, 'term=send'),
      async run({ page }) { await page.evaluate(() => window.replay(14)); },
    },
    {
      name: '05-relay-arrives', step: '05', title: 'The message arrives', subtitle: 'And the answer goes back',
      narration: 'The message reaches the spec\'s session as a message from Claude AI. Claude makes the change and answers, and the answer goes back through the relay.',
      before: (api) => show(api, 'clip=relay-message'),
      async run({ page }) { await page.evaluate(() => window.play(1.4)); },
      minSeconds: 18,
    },
    {
      name: '06-relay-read', card: false,
      narration: 'Later, ask again from anywhere. Claude reads the spec through the relay, with its stage, its pull request, and the answer.',
      before: (api) => show(api, 'term=read'),
      async run({ page }) { await page.evaluate(() => window.replay(12)); },
      minSeconds: 16,
    },
    {
      name: '07-backends', step: '06', title: 'Your backends', subtitle: 'Temporal, a bucket, and how to run it',
      narration: 'The relay keeps its copy of each spec in a Temporal namespace: Temporal Cloud, or a Temporal that you host. Attachments go to any S3 compatible bucket, such as R2, S3 or MinIO. Run it with Docker Compose, Helm, or Docker.',
      before: ({ cut }) => cut(guide),
      async run({ page, wait }) {
        for (const id of ['temporal', 'the-attachment-bucket', 'ways-to-run-the-relay']) {
          await page.evaluate((anchor) => document.getElementById(anchor).scrollIntoView({ behavior: 'smooth' }), id);
          await wait(4200);
        }
      },
    },
    {
      name: '08-outro', kind: 'outro', subtitle: 'The guides take you through each step',
      narration: 'Install Spec Studio with Homebrew. The guides on the site take you through the app, the relay, and its backends.',
    },
    {
      name: '09-end', kind: 'end',
      lines: ['brew install --cask spec-studio-app/tap/spec-studio', 'Guides: spec-studio-app.github.io/site/guides'],
    },
  ],
};
