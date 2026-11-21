<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { latest, installCommand, downloadUrl } from '../releases';

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(installCommand);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

<header class="hero page" data-testid="hero">
	<a class="brand" href={resolve("/")}>
		<img src={asset("logo.png")} alt="" width="64" height="64" />
		<span>Spec Studio</span>
	</a>

	<div class="lead">
		<h1>Spec-driven development with Claude Code, in one calm window.</h1>
		<div class="aside">
			<p>
				Write a spec with Claude. Spec Studio moves it through five stages, with a clear approval gate at each
				one.
			</p>
			<img class="peek" src={asset("stages/hero.webp")} alt="" width="480" height="293" />
		</div>
	</div>

	{#if latest}
		<div class="install">
			<div class="command">
				<code>{installCommand}</code>
				<button type="button" class="copy" onclick={copy} aria-label="Copy the install command">
					{#if copied}
						<span class="copied" data-testid="copied">Copied</span>
					{:else}
						<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
							<rect x="6.5" y="6.5" width="10" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5" />
							<path d="M4 13.5V4.5A1.5 1.5 0 0 1 5.5 3h7" fill="none" stroke="currentColor" stroke-width="1.5" />
						</svg>
					{/if}
				</button>
			</div>
			<a class="download" href={downloadUrl(latest)} data-testid="download">Download .dmg</a>
		</div>
		<p class="fine">Free. macOS 26 or later. Apple silicon.</p>
	{:else}
		<p class="soon" data-testid="coming-soon">Coming soon</p>
		<p class="fine">Free. macOS 26 or later. Apple silicon.</p>
	{/if}
</header>

<style>
	.hero {
		padding-block: clamp(28px, 5vw, 56px) clamp(40px, 6vw, 72px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		text-decoration: none;
		font-family: var(--display);
		font-weight: 700;
		font-size: clamp(1.5rem, 1.2rem + 1vw, 2.125rem);
		letter-spacing: -0.02em;
	}

	.brand img {
		width: clamp(48px, 5vw, 64px);
	}

	.lead {
		display: grid;
		grid-template-columns: minmax(0, 8.2fr) minmax(0, 3.8fr);
		gap: clamp(24px, 5vw, 72px);
		align-items: start;
		margin-top: clamp(24px, 4vw, 40px);
	}

	h1 {
		font-size: clamp(2.75rem, 1.4rem + 4.6vw, 5.5rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 0.98;
	}

	.aside {
		padding-top: 0.6em;
		font-size: clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
		line-height: 1.45;
	}

	.peek {
		width: min(100%, 300px);
		margin-top: 28px;
	}

	.install {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 32px;
		margin-top: clamp(28px, 4vw, 44px);
	}

	.command {
		flex: 1 1 520px;
		max-width: 720px;
		display: flex;
		align-items: stretch;
		border: 1.5px solid var(--rule);
		background: rgb(255 255 255 / 0.35);
		min-width: 0;
	}

	code {
		flex: 1;
		min-width: 0;
		padding: 14px 18px;
		font-family: var(--mono);
		font-size: clamp(0.8125rem, 0.7rem + 0.35vw, 1.0625rem);
		white-space: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.copy {
		flex: none;
		display: grid;
		place-items: center;
		min-width: 64px;
		padding: 0 16px;
		border: 0;
		border-left: 1px solid var(--hairline);
		background: none;
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}

	.copy:hover {
		background: rgb(27 28 32 / 0.05);
	}

	.copied {
		font-family: var(--mono);
		font-size: 0.875rem;
		color: var(--sky-ink);
	}

	.download {
		flex: 0 0 auto;
		display: inline-grid;
		place-items: center;
		padding: 14px 44px;
		border: 1.5px solid var(--rule);
		font-family: var(--display);
		font-weight: 700;
		font-size: 1.25rem;
		text-decoration: none;
		transition: background-color 150ms ease-out, color 150ms ease-out;
	}

	.download:hover {
		background: var(--ink);
		color: var(--paper);
	}

	.soon {
		margin-top: clamp(28px, 4vw, 44px);
		font-family: var(--display);
		font-weight: 700;
		font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
	}

	.fine {
		margin-top: 12px;
		font-style: italic;
		font-size: 0.95rem;
		color: var(--ink-soft);
	}

	@media (max-width: 760px) {
		.lead {
			grid-template-columns: 1fr;
		}

		.peek {
			display: none;
		}

		.download {
			width: 100%;
		}
	}
</style>
