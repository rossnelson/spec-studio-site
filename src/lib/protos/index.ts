import { Proto, check, critter, esc, lines, rect, ring, text, windowFrame } from './kit';

/**
 * The guide prototypes. A guide shows one with `![<label>](proto:<name>)`:
 * the label is what a screen reader says. Each function draws one part of
 * the Spec Studio window, as the app shows it in version 0.1.
 */

const STAGES = ['Spec', 'Plan', 'Build', 'Check', 'Merge'];

/** The empty window of the first open, and the click on Add a Repo. */
function firstOpen(label: string): string {
	const p = new Proto('first-open', 7);
	const press = p.press(0.42);
	const body =
		rect(1, 37, 190, 402, 'p-side', 0) +
		text(18, 62, 'REPOS', 'p-soft p-ui p-tiny p-caps') +
		`<path d="M160 52 h14 v10 h-14 z M164 52 v-3 h5 l1 3" class="p-line" fill="none"/>` +
		[0, 1, 2, 3, 4, 5].map((i) => critter(330 + i * 44, 214 + (i % 2) * 4, 12, `p-critter p-critter-${i % 3}`)).join('') +
		`<line x1="312" y1="232" x2="572" y2="232" class="p-rule"/>` +
		text(445, 268, "Nobody's home yet", 'p-accent p-ui p-head', 'text-anchor="middle"') +
		text(445, 290, 'Add a repo. Spec Studio shows the specs in its specs/ folder.', 'p-soft p-ui p-small', 'text-anchor="middle"') +
		`<g class="${press}">${rect(385, 308, 120, 30, 'p-button', 15)}${text(445, 328, 'Add a Repo…', 'p-accent p-ui p-small', 'text-anchor="middle"')}</g>` +
		p.pointer([
			[0, 640, 400],
			[0.3, 448, 322],
			[0.42, 448, 322],
			[0.55, 448, 322],
			[0.75, 640, 400]
		]);
	return p.svg(720, 440, label, windowFrame(720, 440, 'Spec Studio', body));
}

/** The Repos panel: a repo appears, then its first spec. */
function repoAdded(label: string): string {
	const p = new Proto('repo-added', 8);
	const repo = p.at(0.18);
	const spec = p.at(0.38);
	const status = p.at(0.38, 0.6);
	const status2 = p.at(0.6);
	const press = p.press(0.12);
	const body =
		rect(1, 37, 318, 322, 'p-side', 0) +
		text(20, 62, 'REPOS', 'p-soft p-ui p-tiny p-caps') +
		`<g class="${press}"><path d="M280 52 h16 v11 h-16 z M285 52 v-3 h5 l1 3" class="p-line" fill="none"/><path d="M298 50 v6 M295 53 h6" class="p-line"/></g>` +
		`<g class="${repo}">` +
		`<path d="M22 86 l4 4 l4 -4" class="p-line" fill="none"/>` +
		`<path d="M38 80 h16 v11 h-16 z M42 80 v-3 h5 l1 3" class="p-line" fill="none"/>` +
		text(62, 91, 'notes', 'p-ink p-ui') +
		`<path d="M268 80 h14 v9 h-8 l-3 3 v-3 h-3 z" class="p-line" fill="none"/><path d="M296 79 v12 M290 85 h12" class="p-line"/>` +
		`</g>` +
		`<g class="${spec}">` +
		rect(12, 104, 296, 50, 'p-selected', 8) +
		critter(38, 129, 12) +
		text(60, 124, 'open-count', 'p-ink p-mono') +
		rect(152, 112, 62, 17, 'p-chip', 4) +
		text(183, 124.5, 'Autopilot', 'p-soft p-ui p-tiny', 'text-anchor="middle"') +
		`<g class="${status} transient">${text(60, 143, 'Spec · Writing the spec…', 'p-soft p-ui p-small')}</g>` +
		`<g class="${status2}">${text(60, 143, 'Plan · Claude is working', 'p-warn p-ui p-small')}</g>` +
		`</g>` +
		`<line x1="1" y1="318" x2="319" y2="318" class="p-rule"/>` +
		rect(108, 326, 30, 24, 'p-selected', 6) +
		`<path d="M116 333 h14 v10 h-14 z" class="p-line" fill="none"/>` +
		`<path d="M161 331 l-5 9 h5 l-2 7 l7 -10 h-5 l2 -6 z" class="p-line" fill="none"/>` +
		`<path d="M192 344 l6 -12 l6 12 z" class="p-line" fill="none"/>`;
	return p.svg(320, 360, label, windowFrame(320, 360, 'Spec Studio', body));
}

/** The New Spec sheet: Autopilot, the title and the description typed in, then Create. */
function newSpec(label: string): string {
	const p = new Proto('new-spec', 11);
	const title = p.typed(0.08, 0.26);
	const slug = p.at(0.27);
	const desc1 = p.typed(0.3, 0.5);
	const desc2 = p.typed(0.5, 0.66);
	const create = p.press(0.78);
	const field = (y: number, h = 30) => rect(28, y, 444, h, 'p-field', 6);
	const body =
		rect(0, 0, 500, 470, 'p-sheet', 14) +
		text(28, 38, 'New spec in notes', 'p-ink p-ui p-bold') +
		text(28, 68, 'Mode', 'p-ink p-ui p-small p-bold') +
		rect(28, 76, 222, 26, 'p-field', 7) +
		rect(31, 79, 76, 20, 'p-segment-on', 5) +
		text(69, 93.5, 'Autopilot', 'p-ink p-ui p-small', 'text-anchor="middle"') +
		text(144, 93.5, 'Guided', 'p-soft p-ui p-small', 'text-anchor="middle"') +
		text(214, 93.5, 'Loop', 'p-soft p-ui p-small', 'text-anchor="middle"') +
		text(28, 122, 'Claude writes the spec and the plan, builds, opens draft PRs and reviews them.', 'p-soft p-ui p-tiny') +
		text(28, 136, 'You approve once, at the end.', 'p-soft p-ui p-tiny') +
		text(28, 166, 'Title', 'p-ink p-ui p-small p-bold') +
		field(174) +
		`<g class="${title}">${text(40, 194, 'Count the open notes', 'p-ink p-ui')}</g>` +
		text(28, 226, 'Describe the change', 'p-ink p-ui p-small p-bold') +
		field(234, 92) +
		`<g class="${desc1}">${text(40, 256, 'Show how many notes are still open: a badge next to the', 'p-ink p-ui p-small')}</g>` +
		`<g class="${desc2}">${text(40, 274, 'Notes heading, and the count in the page title.', 'p-ink p-ui p-small')}</g>` +
		text(28, 356, 'Slug', 'p-ink p-ui p-small p-bold') +
		field(364) +
		`<g class="${slug}">${text(40, 384, 'count-the-open-notes', 'p-ink p-mono p-small')}</g>` +
		rect(306, 418, 76, 28, 'p-button', 7) +
		text(344, 436.5, 'Cancel', 'p-ink p-ui p-small', 'text-anchor="middle"') +
		`<g class="${create}">${rect(392, 418, 80, 28, 'p-primary', 7)}${text(432, 436.5, 'Create', 'p-on-primary p-ui p-small p-bold', 'text-anchor="middle"')}</g>` +
		p.pointer([
			[0, 560, 480],
			[0.68, 560, 480],
			[0.75, 432, 432],
			[0.84, 432, 432],
			[0.95, 560, 480]
		]);
	return p.svg(500, 470, label, body);
}

/** The header of a spec in Autopilot: the stages fill in, and the status says what Claude does. */
function autopilot(label: string): string {
	const p = new Proto('autopilot', 12);
	// When Spec, Plan and Build are done, as fractions of the cycle. Then Check is the
	// current stage while Claude reviews and waits for you.
	const done = [0.16, 0.32, 0.5];
	const notes: Array<[number, number, string, string]> = [
		[0, 0.16, 'Claude is working', 'Writing the spec from your description.'],
		[0.16, 0.32, 'Claude is working', 'Planning.'],
		[0.32, 0.5, 'Claude is working', 'Building step 2 of 3.'],
		[0.5, 0.7, 'Claude is working', 'Self review: round 1 on notes.'],
		[0.7, 0.97, 'Over to you', 'Ready for your review.']
	];
	const current = [0, ...done];
	// x of each stage's ring: a ring, its label (about 7 px a letter) and a joining line.
	const xs: number[] = [];
	let x = 326;
	for (const stage of STAGES) {
		xs.push(x);
		x += 12 + stage.length * 7 + 34;
	}
	let strip = '';
	STAGES.forEach((stage, i) => {
		const x = xs[i];
		const soft = text(x + 12, 34.5, stage, 'p-soft p-ui p-small');
		const strong = text(x + 12, 34.5, stage, 'p-accent p-ui p-small p-bold');
		let mark = ring(x, 30) + soft;
		if (i < done.length) {
			// Not reached yet, then current, then a check.
			mark =
				(i > 0 ? `<g class="${p.at(0, current[i])} transient">${ring(x, 30)}${soft}</g>` : '') +
				`<g class="${p.at(current[i], done[i])} transient">${ring(x, 30, 'p-accent-line')}${strong}</g>` +
				`<g class="${p.at(done[i])}">${check(x, 30)}${soft}</g>`;
		} else if (i === done.length) {
			mark =
				`<g class="${p.at(0, done[i - 1])} transient">${ring(x, 30)}${soft}</g>` +
				`<g class="${p.at(done[i - 1])}">${ring(x, 30, 'p-accent-line')}${strong}</g>`;
		}
		const lineFrom = x + 12 + stage.length * 7 + 8;
		strip += mark + (i < 4 ? `<line x1="${lineFrom}" y1="30" x2="${xs[i + 1] - 12}" y2="30" class="p-rule"/>` : '');
	});
	const banner = notes
		.map(
			([from, to, head, note], i) =>
				`<g class="${p.at(from, to)}${i < notes.length - 1 ? ' transient' : ''}">` +
				`<circle cx="36" cy="88" r="6" class="${i === notes.length - 1 ? 'p-warn-fill' : 'p-accent-fill'}"/>` +
				text(52, 84, head, i === notes.length - 1 ? 'p-warn p-ui p-bold' : 'p-accent p-ui p-bold') +
				text(52, 103, note, 'p-ink p-ui p-small') +
				`</g>`
		)
		.join('');
	const chips =
		`<g class="${p.at(0.5)}">${rect(20, 132, 98, 20, 'p-chip', 5)}${text(69, 146, 'notes #1 draft ↗', 'p-soft p-ui p-tiny', 'text-anchor="middle"')}</g>` +
		`<g class="${p.at(0.7)}">${rect(126, 132, 198, 20, 'p-chip', 5)}${text(225, 146, 'Self review round 2: No issues found.', 'p-soft p-ui p-tiny', 'text-anchor="middle"')}</g>`;
	const body =
		rect(0, 0, 720, 166, 'p-window', 12) +
		critter(34, 30, 13) +
		text(58, 36, 'Count the open notes', 'p-ink p-ui p-title') +
		text(246, 36, 'open-count', 'p-soft p-mono p-tiny') +
		strip +
		rect(16, 62, 688, 58, 'p-banner', 8) +
		banner +
		chips;
	return p.svg(720, 166, label, body);
}

/** The whole window, with its four parts named. One part lights up at a time. */
function windowParts(label: string): string {
	const p = new Proto('window', 10);
	const parts: Array<[string, number, number, number, number]> = [
		['Sidebar', 1, 37, 170, 402],
		['Status strip', 172, 37, 547, 70],
		['Reader', 172, 108, 280, 331],
		['Claude session', 453, 108, 266, 331]
	];
	const glows = parts
		.map(([, x, y, w, h], i) => `<g class="${p.at(i * 0.25, i * 0.25 + 0.24)} transient">${rect(x + 3, y + 3, w - 6, h - 6, 'p-glow', 6)}</g>`)
		.join('');
	const tags = parts
		.map(([name, x, y, w, h], i) => {
			const tx = x + w / 2;
			// The status strip's tag sits above its banner; the others low in their empty space.
			const ty = i === 1 ? y + 20 : y + h - 60;
			return `${rect(tx - 64, ty - 14, 128, 22, 'p-tag', 11)}${text(tx, ty + 1.5, `${i + 1}  ${name}`, 'p-on-tag p-ui p-small p-bold', 'text-anchor="middle"')}`;
		})
		.join('');
	const body =
		rect(1, 37, 170, 402, 'p-side', 0) +
		text(16, 82, 'REPOS', 'p-soft p-ui p-tiny p-caps') +
		text(34, 104, 'notes', 'p-ink p-ui p-small') +
		rect(10, 114, 152, 36, 'p-selected', 6) +
		critter(28, 132, 9) +
		text(44, 129, 'open-count', 'p-ink p-mono p-tiny') +
		text(44, 143, 'Check · Over to you', 'p-warn p-ui p-tiny') +
		`<line x1="171" y1="37" x2="171" y2="439" class="p-rule"/>` +
		rect(184, 72, 522, 28, 'p-banner', 6) +
		text(196, 90, 'Over to you · Ready for your review.', 'p-warn p-ui p-small') +
		`<line x1="172" y1="107" x2="719" y2="107" class="p-rule"/>` +
		text(186, 132, 'Check', 'p-ink p-ui p-small p-bold') +
		rect(186, 146, 252, 64, 'p-card', 6) +
		text(196, 166, 'Round 2  notes #1', 'p-ink p-ui p-tiny p-bold') +
		[0, 1, 2, 3, 4].map((i) => check(202 + i * 46, 184)).join('') +
		text(196, 202, 'No issues found.', 'p-soft p-ui p-tiny') +
		rect(186, 220, 252, 64, 'p-card', 6) +
		text(196, 240, 'Round 1  notes #1', 'p-ink p-ui p-tiny p-bold') +
		[0, 1, 2, 3, 4].map((i) => check(202 + i * 46, 258)).join('') +
		text(196, 276, '2 findings: 1 important, 1 nit.', 'p-soft p-ui p-tiny') +
		`<line x1="452" y1="107" x2="452" y2="439" class="p-rule"/>` +
		rect(453, 108, 266, 331, 'p-term', 0) +
		text(466, 132, 'Claude  Over to you', 'p-term-soft p-mono p-tiny') +
		text(466, 160, '● I added the test command to the', 'p-term-ink p-mono p-tiny') +
		text(466, 175, '  PR body and answered Claude AI.', 'p-term-ink p-mono p-tiny') +
		text(466, 200, '  PR: github.com/…/notes-demo/pull/1', 'p-term-accent p-mono p-tiny') +
		text(466, 420, '❯ ', 'p-term-ink p-mono p-tiny') +
		glows +
		tags;
	return p.svg(720, 440, label, windowFrame(720, 440, 'Spec Studio', body));
}

/** The reader on a plan, while Claude writes it. */
function plan(label: string): string {
	const p = new Proto('plan', 9);
	const blocks = [
		p.at(0.06),
		p.at(0.16),
		p.at(0.3),
		p.at(0.42),
		p.at(0.52),
		p.at(0.62)
	];
	const body =
		rect(0, 0, 440, 400, 'p-window', 12) +
		text(20, 30, '⤡  Plan', 'p-ink p-ui p-small p-bold') +
		`<line x1="0" y1="46" x2="440" y2="46" class="p-rule"/>` +
		text(24, 82, 'Plan: Count the open notes', 'p-ink p-ui p-title') +
		`<g class="${blocks[0]}">${text(24, 114, 'Approach', 'p-ink p-ui p-bold')}</g>` +
		`<g class="${blocks[1]}">${lines(24, 126, [380, 392, 356, 300])}</g>` +
		`<g class="${blocks[2]}">${text(24, 196, 'Steps', 'p-ink p-ui p-bold')}</g>` +
		`<g class="${blocks[3]}">${text(24, 220, '1.', 'p-soft p-ui p-small')}${lines(44, 213, [300])}</g>` +
		`<g class="${blocks[4]}">${text(24, 242, '2.', 'p-soft p-ui p-small')}${lines(44, 235, [340])}</g>` +
		`<g class="${blocks[5]}">${text(24, 264, '3.', 'p-soft p-ui p-small')}${lines(44, 257, [260])}` +
		text(24, 300, 'Tests', 'p-ink p-ui p-bold') +
		lines(24, 312, [372, 330, 280]) +
		`</g>`;
	return p.svg(440, 400, label, body);
}

/** A self review round: the steps go by, the findings come in, then a clean round 2. */
function review(label: string): string {
	const p = new Proto('review', 12);
	const steps = ['Gather context', 'Find', 'Vote', 'Filter and rank', 'Report'];
	const stepAt = [0.06, 0.2, 0.32, 0.4, 0.46];
	const xs: number[] = [];
	let sx = 24;
	for (const step of steps) {
		xs.push(sx);
		sx += 19 + step.length * 6.1 + 17;
	}
	const finders = ['correctness', 'intent', 'regressions', 'security', 'consistency'];
	let pipeline = '';
	steps.forEach((step, i) => {
		pipeline +=
			`<g class="${p.at(0, stepAt[i])} transient">${ring(xs[i] + 7, 64, 'p-accent-line')}</g>` +
			`<g class="${p.at(stepAt[i])}">${check(xs[i] + 7, 64)}</g>` +
			text(xs[i] + 19, 68.5, step, 'p-ink p-ui p-small') +
			(i < 4 ? text(xs[i + 1] - 15, 68.5, '›', 'p-soft p-ui p-small') : '');
	});
	const chips = finders
		.map((f, i) => {
			const x = 24 + i * 86;
			return `<g class="${p.at(0.08 + i * 0.012, 0.2)} transient">${rect(x, 82, 80, 18, 'p-chip', 9)}${text(x + 40, 94.5, f, 'p-accent p-ui p-tiny', 'text-anchor="middle"')}</g>`;
		})
		.join('');
	const finding = (y: number, id: string, sev: string, sevCls: string, title: string, file: string, from: number) =>
		`<g class="${p.at(from)}">` +
		rect(12, y, 476, 50, 'p-card', 8) +
		text(24, y + 21, id, 'p-soft p-ui p-small p-bold') +
		rect(48, y + 8, sev.length * 7.2 + 14, 18, sevCls, 4) +
		text(55, y + 21, sev, 'p-ui p-tiny p-bold ' + (sevCls === 'p-sev-important' ? 'p-on-important' : 'p-soft')) +
		`<g class="${p.at(from + 0.12)}">${rect(48 + sev.length * 7.2 + 20, y + 8, 30, 18, 'p-chip', 4)}${text(48 + sev.length * 7.2 + 35, y + 21, 'fix', 'p-warn p-ui p-tiny', 'text-anchor="middle"')}</g>` +
		text(48 + sev.length * 7.2 + 60, y + 21, title, 'p-ink p-ui p-small') +
		text(24, y + 40, file, 'p-soft p-mono p-tiny') +
		`<g class="${p.at(from + 0.2)}">${text(476, y + 40, 'done', 'p-ok p-ui p-tiny p-bold', 'text-anchor="end"')}</g>` +
		`</g>`;
	const body =
		rect(0, 0, 500, 330, 'p-window', 12) +
		text(16, 26, 'Self review', 'p-soft p-ui p-small p-bold') +
		rect(12, 36, 476, 82, 'p-card', 8) +
		text(24, 50, 'Round 1  notes #1', 'p-ink p-ui p-small p-bold') +
		pipeline +
		chips +
		`<g class="${p.at(0.47)}">${text(24, 108, '2 findings: 1 important, 1 nit.', 'p-ink p-ui p-small')}</g>` +
		finding(126, 'T1', 'important', 'p-sev-important', 'Screen readers ignore the badge’s label', 'app.js:21', 0.5) +
		finding(184, 'T2', 'nit', 'p-sev-nit', 'openCount(notes) hides the global notes', 'app.js:13', 0.56) +
		`<g class="${p.at(0.82)}">` +
		rect(12, 244, 476, 74, 'p-card', 8) +
		text(24, 266, 'Round 2  notes #1  ·  the fixes only', 'p-ink p-ui p-small p-bold') +
		steps.map((_, i) => check(31 + i * 30, 284)).join('') +
		text(24, 308, 'No issues found. Over to you.', 'p-ok p-ui p-small p-bold') +
		`</g>`;
	return p.svg(500, 330, label, body);
}

/** Settings > Remote Relay: the URL and the code typed in, Pair, then Connected. */
function settingsRelay(label: string): string {
	const p = new Proto('settings-relay', 10);
	const url = p.typed(0.06, 0.24);
	const code = p.typed(0.28, 0.4);
	const pair = p.press(0.48);
	const connecting = p.at(0.48, 0.6);
	const connected = p.at(0.6);
	const notPaired = p.at(0, 0.48);
	const body =
		rect(0, 0, 460, 470, 'p-window', 12) +
		[22, 40, 58].map((x) => `<circle cx="${x}" cy="18" r="5.5" class="p-light"/>`).join('') +
		rect(170, 8, 120, 22, 'p-chip', 11) +
		text(230, 23.5, 'Remote Relay', 'p-ink p-ui p-small', 'text-anchor="middle"') +
		`<line x1="0" y1="38" x2="460" y2="38" class="p-rule"/>` +
		text(24, 64, 'Connect Spec Studio to your relay. Then Claude AI can read your', 'p-ink p-ui p-small') +
		text(24, 81, 'specs and send messages to their sessions, also when this Mac is off.', 'p-ink p-ui p-small') +
		text(24, 112, 'STATUS', 'p-soft p-ui p-tiny p-caps') +
		rect(24, 120, 412, 52, 'p-card', 8) +
		`<g class="${notPaired} transient"><circle cx="42" cy="146" r="5" class="p-mute-fill"/>${text(56, 150.5, 'Not paired', 'p-soft p-ui p-bold')}</g>` +
		`<g class="${connecting} transient"><circle cx="42" cy="146" r="5" class="p-warn-fill ${p.pulse(0.6)}"/>${text(56, 150.5, 'Connecting…', 'p-warn p-ui p-bold')}</g>` +
		`<g class="${connected}"><circle cx="42" cy="146" r="5" class="p-ok-fill"/>${text(56, 150.5, 'Connected', 'p-ink p-ui p-bold')}${text(146, 150.5, 'wss://relay.example.com/agent', 'p-soft p-mono p-tiny')}</g>` +
		text(24, 202, 'PAIR', 'p-soft p-ui p-tiny p-caps') +
		rect(24, 210, 412, 146, 'p-card', 8) +
		text(40, 234, 'Relay URL', 'p-ink p-ui p-small p-bold') +
		rect(40, 242, 380, 26, 'p-field', 5) +
		`<g class="${url}">${text(50, 259.5, 'wss://relay.example.com/agent', 'p-ink p-mono p-small')}</g>` +
		text(40, 290, 'Pairing code', 'p-ink p-ui p-small p-bold') +
		rect(40, 298, 380, 26, 'p-field', 5) +
		`<g class="${code}">${text(50, 315.5, 'K7QM-2XRD-9VHP', 'p-ink p-mono p-small')}</g>` +
		`<g class="${pair}">${rect(40, 330, 52, 20, 'p-primary', 5)}${text(66, 344, 'Pair', 'p-on-primary p-ui p-small p-bold', 'text-anchor="middle"')}</g>` +
		text(24, 386, 'MCP URL FOR CLAUDE AI', 'p-soft p-ui p-tiny p-caps') +
		rect(24, 394, 412, 56, 'p-card', 8) +
		text(40, 418, 'https://relay.example.com/mcp', 'p-ink p-mono p-small') +
		rect(372, 405, 50, 22, 'p-button', 5) +
		text(397, 420, 'Copy', 'p-ink p-ui p-small', 'text-anchor="middle"') +
		text(40, 440, 'Add this URL as a custom connector in Claude AI.', 'p-soft p-ui p-tiny');
	return p.svg(460, 470, label, body);
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

/** The prototype with this name, as an SVG string, or undefined. */
export function proto(name: string, label: string): string | undefined {
	const draw = protos[name];
	return draw ? draw(label) : undefined;
}

export { esc };
