import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// R5.S4: the backends guide names the same settings, with the same defaults,
// as the settings table in the relay's README. A change to the relay's
// settings fails this test until the guide follows.
const relayReadme = 'https://raw.githubusercontent.com/spec-studio-app/relay/main/README.md';

type Setting = { required: string; default: string };

/** The rows of the first table after the `## Settings` (README) or `## Every setting` (guide) heading. */
export function settingsTable(markdown: string, heading: string): Map<string, Setting> {
	const start = markdown.indexOf(`\n## ${heading}\n`);
	if (start < 0) throw new Error(`cannot read the relay settings table: no "## ${heading}" heading`);
	const lines = markdown.slice(start).split('\n');
	const first = lines.findIndex((line) => line.startsWith('| Setting |'));
	if (first < 0) throw new Error('cannot read the relay settings table: no "| Setting |" header');
	const settings = new Map<string, Setting>();
	for (const line of lines.slice(first + 2)) {
		if (!line.startsWith('|')) break;
		const [names, required, description] = line.split('|').slice(1, -1).map((cell) => cell.trim());
		const found = /Default:? ([^.]*(?:\.\d+[^.]*)?)\./.exec(description);
		for (const name of names.split(',')) {
			settings.set(name.trim().replace(/`/g, ''), { required, default: found ? found[1].trim() : '' });
		}
	}
	if (settings.size === 0) throw new Error('cannot read the relay settings table: it has no rows');
	return settings;
}

test('the backends guide has every relay setting with the same default, and no other', async () => {
	const response = await fetch(relayReadme);
	expect(response.ok, `GET ${relayReadme}`).toBe(true);
	const relay = settingsTable(await response.text(), 'Settings');
	const guide = settingsTable(readFileSync(new URL('../src/guides/backends.md', import.meta.url), 'utf8'), 'Every setting');

	expect([...guide.keys()].filter((name) => !relay.has(name)), 'settings in the guide that the relay does not read').toEqual([]);
	expect([...relay.keys()].filter((name) => !guide.has(name)), 'relay settings that the guide does not name').toEqual([]);
	for (const [name, setting] of relay) expect(guide.get(name), name).toEqual(setting);
});
