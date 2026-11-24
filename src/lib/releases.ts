import data from '$releases';

/** One public release. The release pipeline (scripts/release.sh in the app repo) writes these. */
export type Release = {
	version: string;
	/** ISO date, for example 2026-12-03. */
	date: string;
	notes: string;
	/** The .dmg file name in the GitHub Release. */
	dmg: string;
};

export const releases: Release[] = data;
export const latest: Release | undefined = releases[0];

export const repo = 'spec-studio-app/site';
export const releasesUrl = `https://github.com/${repo}/releases`;
export const installCommand = 'brew install --cask spec-studio-app/tap/spec-studio';

export function downloadUrl(release: Release): string {
	return `https://github.com/${repo}/releases/download/v${release.version}/${release.dmg}`;
}

/** "Dec 3, 2026". UTC, so the date never moves a day with the build machine's time zone. */
export function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
