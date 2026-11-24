import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The release pipeline writes src/lib/releases.json. The tests build the site
// again with other files (RELEASES_FILE) and into other folders (SITE_OUT).
const releases = process.env.RELEASES_FILE
	? fileURLToPath(new URL(process.env.RELEASES_FILE, import.meta.url))
	: fileURLToPath(new URL('./src/lib/releases.json', import.meta.url));
const out = process.env.SITE_OUT ?? 'build';

export default defineConfig({
	resolve: {
		alias: { '$releases': releases }
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// GitHub Pages serves the site at /site/.
			paths: { base: '/site' },
			adapter: adapter({ pages: out, assets: out, strict: true })
		})
	]
});
