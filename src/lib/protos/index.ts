import { Replica, crit, esc, icon, stages, tick, titlebar, todo } from './replica';

/**
 * The guide replicas of the app. A guide shows one with
 * `![<label>](proto:<name>)`: the label is what a screen reader says.
 * Each draws one part of the Spec Studio window as version 0.1 shows it,
 * with the demo repo `notes` and its spec `open-count`. The creatures are
 * the specs' own (critter.ts), so they look as they do in the app.
 */

const SPEC = 'open-count';
/** The crew of the empty window, as in CritterParty.swift. */
const CREW = ['maple', 'gizmo', 'poppy', 'pickle', 'truffle', 'dumpling', 'waffle'];

/** The bottom bar of the sidebar: Repos, Priority, Shipped. */
function panelBar(badge = 0): string {
	return (
		`<div class="rp-panelbar"><span class="on">${icon.folder}</span>` +
		`<span>${icon.bolt}${badge ? `<sup>${badge}</sup>` : ''}</span><span>${icon.party}</span></div>`
	);
}

/** A spec row of the sidebar. */
function specRow(name: string, mood: Parameters<typeof crit>[1], line: string, selected = true): string {
	return (
		`<div class="rp-specrow${selected ? ' selected' : ''}">${crit(name, mood, 26)}` +
		`<div><div class="rp-specname"><span class="mono">${esc(name)}</span><span class="rp-chip">Autopilot</span></div>` +
		`<div class="rp-specline">${line}</div></div></div>`
	);
}

/** The empty window of the first open: the crew waits, and the pointer clicks Add a Repo. */
function firstOpen(label: string): string {
	const r = new Replica('first-open', 8);
	const press = r.press(0.5);
	const hello = r.at(0.08, 0.4);
	const moods = ['working', 'working', 'yours', 'yours', 'asleep', 'working', 'yours'] as const;
	const crew = CREW.map((name, i) => `<span class="rp-crewmate">${crit(name, moods[i], 40)}</span>`).join('');
	const html =
		titlebar('Spec Studio') +
		`<div class="rp-row" style="height:372px">` +
		`<aside class="rp-sidebar" style="width:190px"><div class="rp-sidehead"><span>REPOS</span>${icon.folderAdd}</div><div style="flex:1"></div>${panelBar()}</aside>` +
		`<main class="rp-empty">` +
		`<div class="rp-crew"><div class="rp-bubble transient ${hello}">Hello?</div>${crew}</div>` +
		`<div class="rp-empty-title">Nobody's home yet</div>` +
		`<div class="rp-empty-text">Add a repo. Spec Studio shows the specs in its specs/ folder, and the crew moves in.</div>` +
		`<div class="rp-button ${press}">${icon.folderAdd}<span>Add a Repo…</span></div>` +
		`</main></div>` +
		r.pointer([
			[0, 640, 380],
			[0.36, 452, 300],
			[0.5, 452, 300],
			[0.6, 452, 300],
			[0.82, 640, 380]
		]);
	return r.svg(720, 400, label, html, 'rp-window');
}

/** The Repos panel: the repo appears, then its first spec, working. */
function repoAdded(label: string): string {
	const r = new Replica('repo-added', 9);
	const repo = r.at(0.16);
	const spec = r.at(0.36);
	const press = r.press(0.1);
	const html =
		titlebar('Spec Studio') +
		`<aside class="rp-sidebar" style="height:302px">` +
		`<div class="rp-sidehead"><span>REPOS</span><span class="${press}">${icon.folderAdd}</span></div>` +
		`<div class="rp-repo ${repo}">${icon.chevron}${icon.folder}<span>notes</span><em>${icon.chat}${icon.plus}</em></div>` +
		`<div class="${spec}">${specRow(SPEC, 'working', '<span class="accent">Spec · Claude is working</span>')}</div>` +
		`<div style="flex:1"></div>${panelBar()}</aside>`;
	return r.svg(320, 330, label, html, 'rp-window');
}

/** The New Spec sheet: Autopilot, the title and the description typed in, the slug follows, then Create. */
function newSpec(label: string): string {
	const r = new Replica('new-spec', 12);
	const title = r.typed(0.06, 0.2);
	const slug = r.typed(0.2, 0.26);
	const d1 = r.typed(0.3, 0.48);
	const d2 = r.typed(0.48, 0.62);
	const create = r.press(0.78);
	const html =
		`<div class="rp-sheet">` +
		`<div class="rp-sheet-title">New spec in notes</div>` +
		`<label>Mode</label>` +
		`<div class="rp-segmented"><span class="on">Autopilot</span><span>Guided</span><span>Loop</span></div>` +
		`<p class="rp-help">Claude writes the spec and the plan, builds, opens draft PRs and reviews them. You approve once, at the end.</p>` +
		`<label>Title</label>` +
		`<div class="rp-field"><span class="${title}">Count the open notes</span></div>` +
		`<p class="rp-help">A few words. They become the spec's title.</p>` +
		`<label>Describe the change</label>` +
		`<div class="rp-field rp-area"><span class="${d1}">Show how many notes are still open: a small badge</span><br/>` +
		`<span class="${d2}">next to the Notes heading, and the count in the page title.</span></div>` +
		`<p class="rp-help">Claude writes the spec and the plan from this, with no interview, and continues to reviewed draft PRs.</p>` +
		`<label>Slug</label>` +
		`<div class="rp-field mono"><span class="${slug}">count-the-open-notes</span></div>` +
		`<p class="rp-help">The folder name: specs/count-the-open-notes. Lowercase letters, digits and hyphens.</p>` +
		`<div class="rp-sheet-buttons"><span class="rp-btn">Cancel</span><span class="rp-btn primary ${create}">Create</span></div>` +
		`</div>` +
		r.pointer([
			[0, 560, 560],
			[0.68, 560, 560],
			[0.76, 470, 494],
			[0.86, 470, 494],
			[0.97, 560, 560]
		]);
	return r.svg(540, 540, label, html, 'rp-backdrop');
}

/** The header of a spec in Autopilot: the stages fill in while Claude works, then it is your turn. */
function autopilot(label: string): string {
	const r = new Replica('autopilot', 14);
	const phases: Array<[number, number, number, string, string, 'working' | 'yours']> = [
		[0, 0.18, 0, 'Claude is working', 'Writing the spec from your description.', 'working'],
		[0.18, 0.34, 1, 'Claude is working', 'Planning.', 'working'],
		[0.34, 0.52, 2, 'Claude is working', 'Building step 2 of 3.', 'working'],
		[0.52, 0.72, 3, 'Claude is working', 'Self review: round 1 on notes.', 'working'],
		[0.72, 0.97, 3, 'Over to you', 'Ready for your review.', 'yours']
	];
	const layers = phases
		.map(([from, to, stage, head, note, mood], i) => {
			const last = i === phases.length - 1;
			return (
				`<div class="rp-layer ${r.at(from, to)}${last ? '' : ' transient'}">` +
				`<div class="rp-header">${icon.sidebar}${crit(SPEC, mood, 34)}<span class="rp-spectitle">Count the open notes</span>` +
				`<span class="mono faint">${SPEC}</span><span class="rp-chip">Autopilot</span><span style="flex:1"></span>${stages(stage)}</div>` +
				`<div class="rp-banner">${mood === 'yours' ? `<span class="yellow">${icon.person}</span>` : `<span class="rp-spinner"></span>`}` +
				`<div><div class="rp-banner-head ${mood === 'yours' ? 'yellow' : 'accent'}">${head}</div><div class="rp-banner-note">${note}</div></div></div>` +
				`</div>`
			);
		})
		.join('');
	const chips =
		`<div class="rp-chips"><span class="rp-chip big ${r.at(0.5)}">notes #1 draft ${icon.link}</span>` +
		`<span class="rp-chip big ${r.at(0.72)}">Self review round 2: No issues found.</span></div>`;
	return r.svg(860, 168, label, `<div class="rp-stack">${layers}</div>${chips}`, 'rp-window');
}

/** A round card of the self review. */
function reviewRound(n: number, kind: string, done: number, summary: string): string {
	const steps = ['Gather context', 'Find', 'Vote', 'Filter and rank', 'Report'];
	return (
		`<div class="rp-card"><div class="rp-cardhead"><b>Round ${n}</b><span class="dim">notes #1</span><span class="rp-chip">${kind}</span><span style="flex:1"></span><span class="rp-done">done</span></div>` +
		`<div class="rp-steps">${steps.map((s, i) => `${i ? '<i>›</i>' : ''}<span>${i < done ? tick() : todo()}${s}</span>`).join('')}</div>` +
		`<div class="rp-cardtext">${summary}</div></div>`
	);
}

/** The whole window, with its four parts named in turn. */
function windowParts(label: string): string {
	const r = new Replica('window', 12);
	const parts: Array<[string, number, number, number, number]> = [
		['Sidebar', 0, 28, 240, 452],
		['Status strip', 240, 28, 860, 110],
		['Reader', 240, 138, 420, 342],
		['Claude session', 660, 138, 440, 342]
	];
	const glows = parts
		.map(
			([name, x, y, w, h], i) =>
				`<div class="rp-glow transient ${r.at(i * 0.25, i * 0.25 + 0.24)}" style="left:${x + 3}px;top:${y + 3}px;width:${w - 6}px;height:${h - 6}px"></div>` +
				`<div class="rp-tag" style="left:${i === 1 ? x + w - 110 : x + w / 2}px;top:${i === 1 ? y + 62 : y + h - 46}px">${i + 1}&nbsp; ${name}</div>`
		)
		.join('');
	const html =
		titlebar('Spec Studio') +
		`<div class="rp-row" style="height:452px">` +
		`<aside class="rp-sidebar" style="width:240px"><div class="rp-sidehead"><span>REPOS</span>${icon.folderAdd}</div>` +
		`<div class="rp-repo">${icon.chevron}${icon.folder}<span>notes</span><em>${icon.chat}${icon.plus}</em></div>` +
		specRow(SPEC, 'yours', '<span class="yellow">Check · Over to you</span>') +
		`<div style="flex:1"></div>${panelBar(1)}</aside>` +
		`<div class="rp-col" style="flex:1">` +
		`<div class="rp-header">${icon.sidebar}${crit(SPEC, 'yours', 32)}<span class="rp-spectitle">Count the open notes</span><span class="mono faint">${SPEC}</span>` +
		`<span class="rp-chip">Autopilot</span><span style="flex:1"></span>${stages(3)}</div>` +
		`<div class="rp-banner"><span class="yellow">${icon.person}</span><div><div class="rp-banner-head yellow">Over to you</div><div class="rp-banner-note">Ready for your review.</div></div></div>` +
		`<div class="rp-row" style="flex:1;min-height:0;border-top:1px solid var(--border)">` +
		`<section class="rp-reader" style="width:420px"><div class="rp-panehead">${icon.expand}<b>Check</b><span style="flex:1"></span>${icon.lines}</div>` +
		`<div class="rp-pad"><div class="rp-subhead">Self review</div>` +
		reviewRound(2, 'backoff-2', 5, 'No issues found.') +
		reviewRound(1, 'standard', 5, '2 findings: 1 important, 1 nit. No candidate was ignored.') +
		`</div></section>` +
		`<section class="rp-term" style="flex:1"><div class="rp-panehead">${icon.expand}<span class="rp-dot yellow"></span><b>Claude</b><span class="dim">Over to you</span><span style="flex:1"></span><span class="mono faint">${SPEC}</span></div>` +
		`<div class="rp-termbody">` +
		`<p>● I added the test command to the PR body and sent the answer back to Claude AI with <span class="accent">studio message</span>.</p>` +
		`<p><b>PR:</b> <span class="accent">github.com/spec-studio-app/notes-demo/pull/1</span></p>` +
		`<p class="dim">✻ Worked for 11s · done 4:20 PM</p>` +
		`<div style="flex:1"></div><div class="rp-prompt">❯ <span class="rp-caret"></span></div></div></section>` +
		`</div></div></div>` +
		glows;
	return r.svg(1100, 480, label, html, 'rp-window');
}

/** The reader on the plan, as Claude writes it. */
function plan(label: string): string {
	const r = new Replica('plan', 12);
	const html =
		`<section class="rp-reader" style="height:100%"><div class="rp-panehead">${icon.expand}<b>Plan</b><span style="flex:1"></span>${icon.lines}</div>` +
		`<div class="rp-doc"><h1>Plan: Count the open notes</h1>` +
		`<h2 class="${r.at(0.04)}">Approach</h2>` +
		`<p class="${r.at(0.1)}">The app draws the whole list in one function, <code>render()</code> in <code>app.js</code>. Every change (page load, a new note, Done, Undo) ends with a <code>render()</code> call. So the count goes into <code>render()</code>: it counts the notes with <code>done === false</code>, writes the number into a badge element, hides the badge when the count is 0, and sets <code>document.title</code> to <code>Notes (N)</code> or <code>Notes</code>.</p>` +
		`<h2 class="${r.at(0.32)}">Steps</h2>` +
		`<ol><li class="${r.at(0.38)}">notes: Add the badge element to the heading in <code>index.html</code> and its style in <code>style.css</code>. Covers R1.</li>` +
		`<li class="${r.at(0.48)}">notes: In <code>app.js</code>, add <code>openCount(notes)</code> and call a new <code>updateCount()</code> from <code>render()</code>. Covers R1, R2.</li>` +
		`<li class="${r.at(0.58)}">notes: Add <code>test/open-count.test.js</code>, a <code>node --test</code> script with a stub DOM, for each scenario. Covers R1, R2.</li></ol>` +
		`</div></section>`;
	return r.svg(460, 420, label, html, 'rp-window');
}

/** The Check section: round 1 runs its steps, finds two problems, they get fixed, and round 2 is clean. */
function review(label: string): string {
	const r = new Replica('review', 14);
	const steps = ['Gather context', 'Find', 'Vote', 'Filter and rank', 'Report'];
	const stepAt = [0.06, 0.2, 0.3, 0.36, 0.42];
	const finders = ['correctness', 'intent', 'regressions', 'security', 'consistency'];
	const round1 =
		`<div class="rp-card"><div class="rp-cardhead"><b>Round 1</b><span class="dim">notes #1</span><span class="rp-chip">standard</span><span style="flex:1"></span>` +
		`<span class="rp-swap"><span class="rp-running transient ${r.at(0, 0.43)}">running</span><span class="rp-done ${r.at(0.43)}">done</span></span></div>` +
		`<div class="rp-steps">${steps
			.map(
				(s, i) =>
					`${i ? '<i>›</i>' : ''}<span><span class="rp-swap"><span class="transient ${r.at(0, stepAt[i])}">${todo()}</span><span class="${r.at(stepAt[i])}">${tick()}</span></span>${s}</span>`
			)
			.join('')}</div>` +
		`<div class="rp-swap rp-below"><div class="rp-finders transient ${r.at(0.07, 0.2)}">${finders.map((f) => `<span class="rp-chip accent">${f}</span>`).join('')}</div>` +
		`<div class="rp-cardtext ${r.at(0.43)}">2 findings: 1 important, 1 nit. No candidate was ignored.</div></div></div>`;
	const finding = (id: string, sev: string, title: string, sha: string, file: string, body: string, t: number) =>
		`<div class="rp-finding ${r.at(t)}"><div class="rp-cardhead"><b class="dim">${id}</b><span class="rp-sev ${sev}">${sev}</span>` +
		`<span class="rp-chip yellow ${r.at(t + 0.1)}">fix</span><b>${title}</b></div>` +
		`<div class="rp-findmeta">self review round 1 · notes #1 · <span class="green ${r.at(t + 0.18)}">done in ${sha}</span> · <span class="mono">${file}</span></div>` +
		`<div class="rp-findbody">${body}</div></div>`;
	const html =
		`<section class="rp-reader" style="height:100%"><div class="rp-panehead">${icon.expand}<b>Check</b><span style="flex:1"></span>${icon.lines}</div>` +
		`<div class="rp-pad"><div class="rp-subhead">Self review</div>` +
		`<div class="${r.at(0.8)}">${reviewRound(2, 'backoff-2', 5, 'No issues found.')}</div>` +
		round1 +
		`<div class="rp-subhead ${r.at(0.46)}">Done or ignored (2)</div>` +
		finding('T1', 'important', 'Screen readers ignore the badge’s aria-label', 'a92bf94', 'app.js:21', 'aria-label on a plain span (no role) is not supported by most screen readers, so they read only the bare number after Notes.', 0.48) +
		finding('T2', 'nit', 'openCount(notes) hides the global notes', 'a62925b', 'app.js:13', 'The parameter has the same name as the module-level notes array.', 0.54) +
		`</div></section>`;
	return r.svg(520, 560, label, html, 'rp-window');
}

/** Settings > Remote Relay: the relay URL and the code go in, Pair, and it connects. */
function settingsRelay(label: string): string {
	const r = new Replica('settings-relay', 11);
	const url = r.typed(0.06, 0.24);
	const code = r.typed(0.28, 0.38);
	const pair = r.press(0.46);
	const html =
		`<div class="rp-settings-top">${titlebar('')}<span class="rp-tab">Remote Relay</span></div>` +
		`<div class="rp-pad">` +
		`<p>Connect Spec Studio to your relay. Then Claude AI can read your specs and send messages to their sessions, also when this Mac is off.</p>` +
		`<p class="accent small">Deploy your own relay ↗</p>` +
		`<div class="rp-caps">STATUS</div>` +
		`<div class="rp-card rp-status rp-swap">` +
		`<div class="transient ${r.at(0, 0.46)}"><span class="rp-dot faint"></span><b class="dim">Not paired</b></div>` +
		`<div class="transient ${r.at(0.46, 0.58)}"><span class="rp-dot yellow rp-blink"></span><b class="yellow">Connecting…</b></div>` +
		`<div class="${r.at(0.58)}"><span class="rp-dot green"></span><b>Connected</b> <span class="mono dim">wss://relay.example.com/agent</span><div class="dim small">Relay version: 0.2.1.</div></div>` +
		`</div>` +
		`<div class="rp-caps">PAIR</div>` +
		`<div class="rp-card">` +
		`<label>Relay URL</label><div class="rp-field mono"><span class="${url}">wss://relay.example.com/agent</span></div>` +
		`<label>Pairing code</label><div class="rp-field mono"><span class="${code}">K7QM-2XRD-9VHP</span></div>` +
		`<span class="rp-btn primary small ${pair}">Pair</span></div>` +
		`<div class="rp-caps">MCP URL FOR CLAUDE AI</div>` +
		`<div class="rp-card rp-mcp"><div><span class="mono">https://relay.example.com/mcp</span><span class="rp-btn small">Copy</span></div>` +
		`<div class="dim small">Add this URL as a custom connector in Claude AI.</div></div>` +
		`</div>`;
	return r.svg(480, 570, label, html, 'rp-window');
}

export const protos: Record<string, (label: string) => string> = {
	'first-open': firstOpen,
	'repo-added': repoAdded,
	'new-spec': newSpec,
	autopilot,
	window: windowParts,
	plan,
	review,
	'settings-relay': settingsRelay
};

/** The replica with this name, as an SVG string, or undefined. */
export function proto(name: string, label: string): string | undefined {
	const draw = protos[name];
	return draw ? draw(label) : undefined;
}
