// The relay video, for the relay guide: what the relay does, its pluggable
// store (JSON files by default, Temporal as an option), the attachment bucket,
// and how to run it. Build it with demo-video-tool:
//
//   MUSIC=<bed.mp3> <demo-video-tool>/bin/demo all video/relay
import { root, serve, show, spoken, stage, stopServers } from '../stage.mjs';

/** The diagram on `from`, then `to` lit a moment after the scene's card leaves. */
const diagram = (from, to) => ({
  before: (api) => show(api, `diagram=${from}`),
  async run({ page, wait }) {
    if (from === to) return;
    await wait(700);
    await page.evaluate((part) => window.light(part), to);
  },
});

export default {
  name: 'spec-studio-relay',
  title: 'The relay',
  subtitle: 'Your specs, away from the Mac',
  url: 'spec-studio-app.github.io/site/guides/relay',
  keys: [],
  // The Spec Studio critter theme (video/theme/). base: where the recorded page finds it.
  theme: { name: '../theme', options: { base: 'http://127.0.0.1:4210/video/theme/' } },
  open: 'card',
  music: { path: process.env.MUSIC ?? null },
  browser: { profile: null, headless: true, viewport: { width: 1920, height: 1080 } },
  video: { background: '#16161e' },
  timing: { cardBeats: 6, holdBeats: 4 },

  async setup({ settle }) {
    serve(root, 4210);
    await new Promise((r) => setTimeout(r, 800));
    await settle(`${stage}?diagram=all`);
  },
  async teardown() {
    stopServers();
  },

  scenes: [
    {
      name: '00-intro', card: { critter: 'antenna' }, kind: 'intro',
      narration: 'The relay is a small MCP server that you host. With it, Claude AI can reach the specs on your Mac from claude.ai, the Claude app, or Claude Code on another computer.',
    },
    {
      name: '01-ask', card: { critter: 'plane' }, step: '01', title: 'Send a spec a message', subtitle: 'From anywhere',
      narration: 'Ask Claude AI to send a spec a message. It finds the spec through the relay, and sends the message.',
      before: (api) => show(api, 'term=send'),
      async run({ page }) { await page.evaluate(() => window.replay(14)); },
    },
    {
      name: '02-arrives', card: { critter: 'envelope' }, step: '02', title: 'The message arrives', subtitle: 'And the answer goes back',
      narration: 'The message reaches the spec\'s Claude session on the Mac. Claude makes the change and answers, and the answer goes back through the relay.',
      before: (api) => show(api, 'clip=relay-message'),
      async run({ page }) { await page.evaluate(() => window.play(1.4)); },
      minSeconds: 18,
    },
    {
      name: '03-read', card: false,
      narration: 'Later, ask again. Claude reads the spec through the relay: its stage, its pull request, and the answer.',
      before: (api) => show(api, 'term=read'),
      async run({ page }) { await page.evaluate(() => window.replay(12)); },
      minSeconds: 16,
    },
    {
      name: '04-connect', card: { critter: 'plug' }, step: '03', title: 'How it connects', subtitle: 'The Mac opens no port',
      narration: 'Claude AI connects to the relay over HTTPS, and signs in with your owner password. The Spec Studio agent on your Mac connects out to the relay, so the Mac opens no port.',
      ...diagram('all', 'link'),
    },
    {
      name: '05-store', card: { critter: 'boxes' }, step: '04', title: 'A pluggable store', subtitle: 'JSON files or Temporal',
      narration: 'The relay keeps a copy of each spec, the messages, and the sign-ins in a store. So Claude AI can read your specs, and leave messages, while the Mac is offline. The store is pluggable, and you choose one of two.',
      ...diagram('all', 'store'),
    },
    {
      name: '06-json', card: { critter: 'files' }, step: '05', title: 'JSON files', subtitle: 'The default',
      narration: 'The default store is JSON files on a volume. The relay is one container and a volume, with no other service. With no store settings, the relay uses JSON files.',
      ...diagram('store', 'json'),
    },
    {
      name: '07-temporal', card: { critter: 'hourglass' }, step: '06', title: 'Temporal', subtitle: 'An option, if you run Temporal',
      narration: 'If you already run Temporal, the relay can keep the same data in your namespace instead, on Temporal Cloud or self-hosted. Set the Temporal address and your payload keys. The relay encrypts every payload with them.',
      ...diagram('json', 'temporal'),
    },
    {
      name: '08-bucket', card: { critter: 'bucket' }, step: '07', title: 'Attachments', subtitle: 'When you set an S3 bucket',
      narration: 'Attachments are optional. Set the four bucket settings for R2, S3, MinIO, or any S3-compatible service, and messages can carry files. Attachments never go into the store. With no bucket, the relay works the same, but with no attachments.',
      before: (api) => show(api, 'diagram=all'),
      async run({ page, plan, wait }) {
        await wait(700);
        await page.evaluate(() => window.light('bucket'));
        await wait(spoken(plan, '08-bucket') * 1000 * 0.68);
        await page.evaluate(() => window.light('nobucket'));
      },
    },
    {
      name: '09-run', card: { critter: 'ship' }, step: '08', title: 'Run it your way', subtitle: 'Docker Compose, Helm or Docker',
      narration: 'Run the relay with Docker Compose, the Helm chart, or Docker. Each release publishes a signed image for Intel and Arm, and the chart.',
      ...diagram('all', 'run'),
    },
    {
      name: '10-outro', card: { critter: 'thumbsup' }, kind: 'outro', subtitle: 'The relay guide takes you through each step',
      narration: 'The relay guide takes you through each step, from the password to the connector in Claude AI.',
    },
    {
      name: '11-end', card: { critter: 'wave' }, kind: 'end',
      lines: ['ghcr.io/spec-studio-app/relay', 'Guide: spec-studio-app.github.io/site/guides/relay'],
    },
  ],
};
