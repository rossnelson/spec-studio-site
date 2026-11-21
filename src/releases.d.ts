// The changelog data. vite.config.ts points $releases at src/lib/releases.json,
// or at RELEASES_FILE in the tests.
declare module '$releases' {
	const releases: { version: string; date: string; notes: string; dmg: string }[];
	export default releases;
}
