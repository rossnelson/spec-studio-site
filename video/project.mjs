// The Spec Studio demo video: the app and its features. The relay has its own
// video, in relay/. Build it with demo-video-tool:
//
//   MUSIC=<bed.mp3> <demo-video-tool>/bin/demo all video
//
// video/README.md says how the stills and clips were made.
import { root, serve, show, spoken, stage, stopServers } from './stage.mjs';

/** A still, or stills in turn (comma-separated), with a slow move in on one point. */
const still = (names, zoom) => `still=${names.split(',').map((n) => `stills/${n}.webp`).join(',')}${zoom ? `&zoom=${zoom}` : ''}`;

export default {
  name: 'spec-studio',
  title: 'Spec Studio',
  subtitle: 'Spec-driven development with Claude Code',
  url: 'spec-studio-app.github.io/site',
  keys: [],
  // The Spec Studio critter theme (video/theme/). base: where the recorded page finds it.
  theme: { name: './theme', options: { base: 'http://127.0.0.1:4210/video/theme/' } },
  open: 'card',
  music: { path: process.env.MUSIC ?? null },
  browser: { profile: null, headless: true, viewport: { width: 1920, height: 1080 } },
  video: { background: '#16161e' },
  timing: { cardBeats: 6, holdBeats: 4 },

  async setup({ settle }) {
    serve(root, 4210);
    await new Promise((r) => setTimeout(r, 800));
    await settle(`${stage}?${still('first-open-dark')}`);
  },
  async teardown() {
    stopServers();
  },

  scenes: [
    {
      name: '00-intro', card: { critter: 'wave' }, kind: 'intro',
      narration: 'Spec Studio is a Mac app for spec-driven development with Claude Code. Each spec gets its own Claude session, and goes through five stages, from a spec to reviewed pull requests.',
    },
    {
      name: '01-window', card: { critter: 'window' }, step: '01', title: 'One window', subtitle: 'Your repos, the reader and Claude',
      narration: 'Add a repo, and its specs show in the sidebar, each with its stage and whose turn it is. Beside it are the reader, which shows the spec\'s documents, and the spec\'s Claude session, a real terminal.',
      before: (api) => show(api, still('plan', '10,14,1.45')),
      async run({ page, plan }) { await page.evaluate((s) => window.play(s), spoken(plan, '01-window')); },
    },
    {
      name: '02-new', card: { critter: 'describe' }, step: '02', title: 'Describe the change', subtitle: 'A title, a few sentences and a mode',
      narration: 'Make a spec with a title and a few sentences about what the user sees when it is done. Then choose a mode. Autopilot goes to reviewed draft pull requests with no question in between. Guided interviews you, and stops for your approval at each stage. Loop takes one small change at a time.',
      before: (api) => show(api, still('new-autopilot,new-guided,new-loop')),
      async run({ page, plan }) {
        const s = spoken(plan, '02-new');
        await page.evaluate((t) => window.play(t), [s * 0.6, s * 0.8]);
      },
    },
    {
      name: '03-spec', card: { critter: 'spec' }, step: '03', title: 'Spec', subtitle: 'Requirements with scenarios',
      narration: 'In Spec, Claude writes the spec: a summary, the scope, and requirements with Given, When, Then scenarios. The reader shows each document as Claude writes it.',
      before: (api) => show(api, still('spec-scenarios', '22,45,1.3')),
      async run({ page, plan }) { await page.evaluate((s) => window.play(s), spoken(plan, '03-spec')); },
    },
    {
      name: '04-plan', card: { critter: 'plan' }, step: '04', title: 'Plan', subtitle: 'The approach, the steps and the tests',
      narration: 'In Plan, Claude studies the code. It writes the approach, the repos that change, the steps, and a test for each scenario.',
      before: (api) => show(api, still('plan,plan-steps')),
      async run({ page, plan }) { await page.evaluate((s) => window.play([s * 0.5]), spoken(plan, '04-plan')); },
    },
    {
      name: '05-build', card: { critter: 'build' }, step: '05', title: 'Build', subtitle: 'A worktree, a branch, a draft pull request',
      narration: 'In Build, Claude works in its own worktree and branch. It commits each step, pushes, and opens a draft pull request. The Changes section shows each file and its diff.',
      before: (api) => show(api, still('build,changes')),
      async run({ page, plan }) { await page.evaluate((s) => window.play([s * 0.62]), spoken(plan, '05-build')); },
    },
    {
      name: '06-shell', card: { critter: 'shell' }, step: '06', title: 'A shell beside Claude', subtitle: 'In the spec\'s worktree',
      narration: 'Each spec also has a shell in its worktree. Run the tests, the app or git there. The studio command works in any terminal: here it lists the specs that need you.',
      before: (api) => show(api, still('shell-tests,shell-studio')),
      async run({ page, plan }) { await page.evaluate((s) => window.play([s * 0.55]), spoken(plan, '06-shell')); },
    },
    {
      name: '07-check', card: { critter: 'check' }, step: '07', title: 'Check', subtitle: 'A review before yours',
      narration: 'In Check, a self review reads each pull request with parallel finders. Three verifiers vote on each finding, and a finding needs two of three votes. Here, round one found two problems. Claude fixed both, and round two found nothing.',
      before: (api) => show(api, still('check', '28,42,1.3')),
      async run({ page, plan }) { await page.evaluate((s) => window.play(s), spoken(plan, '07-check')); },
    },
    {
      name: '08-turn', card: { critter: 'handover' }, step: '08', title: 'Over to you', subtitle: 'Then Merge, when you say so',
      narration: 'The strip at the top says whose turn it is. The Priority panel lists the specs that need you, across all your repos. In Merge, Claude works through the reviewers\' comments with you, and merges when you say so.',
      before: (api) => show(api, still('priority', '30,10,1.35')),
      async run({ page, plan }) { await page.evaluate((s) => window.play(s), spoken(plan, '08-turn')); },
    },
    {
      name: '09-areas', card: { critter: 'boxes' }, step: '09', title: 'Areas and projects', subtitle: 'Many repos, one goal',
      narration: 'Put your repos in areas, each with its color. Fold an area, and it shows how many specs need you. A project collects specs from many repos, with milestones, and a spec can wait for another spec.',
      before: (api) => show(api, still('areas-sidebar,areas-folded,project-view')),
      async run({ page, plan }) {
        const s = spoken(plan, '09-areas');
        await page.evaluate((t) => window.play(t), [s * 0.3, s * 0.55]);
      },
    },
    {
      name: '10-themes', card: { critter: 'palette' }, step: '10', title: 'Your colors', subtitle: 'The app and its terminals',
      narration: 'Choose the colors of the app and its terminals from the Ghostty themes, light or dark.',
      before: (api) => show(api, still('theme,theme-day')),
      async run({ page, plan }) { await page.evaluate((s) => window.play([s * 0.5]), spoken(plan, '10-themes')); },
      minSeconds: 9,
    },
    {
      name: '11-outro', card: { critter: 'thumbsup' }, kind: 'outro', subtitle: 'The guides take you through each step',
      narration: 'Install Spec Studio with Homebrew. The guides on the site take you through each step.',
    },
    {
      name: '12-end', card: { critter: 'merge' }, kind: 'end',
      lines: ['brew install --cask spec-studio-app/tap/spec-studio', 'Guides: spec-studio-app.github.io/site/guides'],
    },
  ],
};
