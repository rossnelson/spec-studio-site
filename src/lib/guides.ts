import { Marked, type Tokens } from 'marked';
import { asset, resolve } from '$app/paths';
import { latest, installCommand, downloadUrl } from './releases';

/**
 * The guides are Markdown files in src/guides/. Each starts with a front
 * matter block:
 *
 *     ---
 *     title: Get started
 *     summary: Install the app and make your first spec.
 *     order: 1
 *     ---
 *
 * The site renders them at build time (every page is prerendered), so a
 * guide needs no JavaScript to read.
 */
export type GuideMeta = { slug: string; title: string; summary: string; order: number };
export type Guide = GuideMeta & { html: string };

const files = import.meta.glob('../guides/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>;

/** Splits the front matter from the Markdown. Only `key: value` lines. */
export function parseFrontMatter(source: string): { data: Record<string, string>; body: string } {
	const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
	if (!match) return { data: {}, body: source };
	const data: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const at = line.indexOf(':');
		if (at > 0) data[line.slice(0, at).trim()] = line.slice(at + 1).trim();
	}
	return { data, body: source.slice(match[0].length) };
}

function meta(path: string, data: Record<string, string>): GuideMeta {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	if (!data.title || !data.summary || !data.order) throw new Error(`${path}: the front matter needs title, summary and order`);
	return { slug, title: data.title, summary: data.summary, order: Number(data.order) };
}

/** Every guide, in reading order. */
export const guides: GuideMeta[] = Object.entries(files)
	.map(([path, source]) => meta(path, parseFrontMatter(source).data))
	.sort((a, b) => a.order - b.order);

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "Add a repo" -> "add-a-repo". */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z]+;/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** A site path ("/guides/relay/") gets the base path; other links stay as they are. */
function sitePath(href: string): string {
	if (!href.startsWith('/')) return href;
	const [path, hash] = href.split('#');
	const resolved = path === '/' ? resolve('/') : `${resolve('/').replace(/\/$/, '')}${path}`;
	return hash ? `${resolved}#${hash}` : resolved;
}

/** The shells whose blocks get a copy button. */
const shells = new Set(['sh', 'shell', 'bash', 'zsh', 'console']);

/**
 * `{{install}}` on its own line becomes the install step: the brew command and
 * the .dmg download, or only "Coming soon" before the first release, the same
 * as the launch page's hero.
 */
export function expandInstall(body: string): string {
	const replacement = latest
		? `Install with [Homebrew](https://brew.sh):\n\n\`\`\`sh\n${installCommand}\n\`\`\`\n\n` +
			`Or [download the .dmg](${downloadUrl(latest)}) of version ${latest.version}, and drag Spec Studio to Applications.`
		: '<p class="soon" data-testid="install-soon">Coming soon. The first public build is on its way.</p>';
	return body.replace(/^\{\{install\}\}$/m, replacement);
}

function renderer() {
	const marked = new Marked();
	marked.use({
		renderer: {
			heading({ tokens, depth }: Tokens.Heading) {
				const text = this.parser.parseInline(tokens);
				const id = slugify(text);
				return `<h${depth} id="${id}">${text}</h${depth}>\n`;
			},
			code({ text, lang }: Tokens.Code) {
				const language = (lang ?? '').trim().split(/\s+/)[0];
				const code = `<pre><code${language ? ` class="language-${escape(language)}"` : ''}>${escape(text)}</code></pre>`;
				if (!shells.has(language)) return `<div class="code">${code}</div>\n`;
				return (
					`<div class="code" data-copy-block>${code}` +
					`<button type="button" class="copy" data-copy aria-label="Copy the command">Copy</button>` +
					`<span class="sr-only" role="status" aria-live="polite" data-copy-status></span></div>\n`
				);
			},
			// Screenshots: shots/name.webp shows shots/name-dark.webp in the
			// dark theme, from the first paint and with no JavaScript.
			image({ href, title, text }: Tokens.Image) {
				if (!href.startsWith('shots/')) {
					return `<img src="${escape(sitePath(href))}" alt="${escape(text)}" loading="lazy" />`;
				}
				// The shots are added to static/guides/ by scripts/shots.sh, so their names are not in asset()'s list.
				const light = asset(`guides/${href.slice('shots/'.length)}` as Parameters<typeof asset>[0]);
				const dark = light.replace(/\.(\w+)$/, '-dark.$1');
				const caption = title ? `<figcaption>${escape(title)}</figcaption>` : '';
				return (
					`<figure class="shot"><picture>` +
					`<source srcset="${dark}" media="(prefers-color-scheme: dark)" />` +
					`<img src="${light}" alt="${escape(text)}" loading="lazy" data-shot /></picture>${caption}</figure>`
				);
			},
			link({ href, title, tokens }: Tokens.Link) {
				const text = this.parser.parseInline(tokens);
				const external = /^https?:/.test(href);
				return `<a href="${escape(sitePath(href))}"${title ? ` title="${escape(title)}"` : ''}${external ? ' rel="noopener"' : ''}>${text}</a>`;
			},
			table(token: Tokens.Table) {
				// A wide table scrolls on its own, never the page.
				const head = token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join('');
				const rows = token.rows
					.map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`)
					.join('\n');
				return `<div class="table"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
			}
		}
	});
	return marked;
}

/** The guide with this slug, rendered, or undefined. */
export function guide(slug: string): Guide | undefined {
	const entry = Object.entries(files).find(([path]) => path.endsWith(`/${slug}.md`));
	if (!entry) return undefined;
	const { data, body } = parseFrontMatter(entry[1]);
	const html = renderer().parse(expandInstall(body), { async: false }) as string;
	return { ...meta(entry[0], data), html };
}

/** The raw Markdown of a guide, for the tests that compare it with other sources. */
export function guideSource(slug: string): string | undefined {
	return Object.entries(files).find(([path]) => path.endsWith(`/${slug}.md`))?.[1];
}
