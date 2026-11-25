<script lang="ts">
	import { tick } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import Sketch from '../Sketch.svelte';
	import { latest, installCommand, downloadUrl } from '../releases';

	// The result of the last copy: 'copied', 'failed', or '' after 2 seconds.
	let result = $state<'' | 'copied' | 'failed'>('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		// Clear the status first, so that a second copy is announced again.
		result = '';
		await tick();
		try {
			await navigator.clipboard.writeText(installCommand);
			result = 'copied';
		} catch {
			result = 'failed';
		}
		clearTimeout(timer);
		timer = setTimeout(() => (result = ''), 2000);
	}
</script>

<header class="hero page" data-testid="hero">
	<div class="top">
		<a class="brand" href={resolve('/')}>
			<Sketch class="logo" light={asset('logo.png')} dark={asset('logo-dark.png')} alt="" width={256} height={256} />
			<span>Spec Studio</span>
		</a>
		<nav aria-label="Site">
			<a href={resolve('/guides')}>Guides</a>
		</nav>
	</div>

	<div class="lead">
		<h1>Spec-driven development with Claude Code, in one window.</h1>
		<div class="aside">
			<p>Write a spec with Claude. Claude plans it, builds it, reviews it and merges it. You choose where it stops.</p>
			<Sketch
				class="peek"
				light={asset('stages/hero.webp')}
				dark={asset('stages/hero-dark.webp')}
				alt=""
				width={520}
				height={274}
			/>
		</div>
	</div>

	{#if latest}
		<div class="install">
			<div class="command">
				<code>{installCommand}</code>
				<button type="button" class="copy" onclick={copy} aria-label="Copy the install command">
					{#if result === 'copied'}
						<span class="copied" data-testid="copied" aria-hidden="true">Copied</span>
					{:else if result === 'failed'}
						<span class="copied" aria-hidden="true">Failed</span>
					{:else}
						<svg viewBox="0 0 20 20" aria-hidden="true">
							<rect x="6.5" y="6.5" width="10" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5" />
							<path d="M4 13.5V4.5A1.5 1.5 0 0 1 5.5 3h7" fill="none" stroke="currentColor" stroke-width="1.5" />
						</svg>
					{/if}
				</button>
			</div>
			<!-- Screen readers hear the result of the copy here. -->
			<span class="visually-hidden" role="status" data-testid="copy-status">
				{#if result === 'copied'}Copied the install command.{:else if result === 'failed'}Could not copy. Select the command and copy it.{/if}
			</span>
			<a class="download" href={downloadUrl(latest)} data-testid="download">Download .dmg</a>
		</div>
	{:else}
		<p class="soon" data-testid="coming-soon">Coming soon</p>
	{/if}
	<p class="fine">Free. macOS 26 or later. Apple silicon.</p>
</header>

<style>
	.hero {
		padding-top: max(20px, calc(3 * var(--u)));
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	nav a {
		font-size: max(1.0625rem, calc(1.95 * var(--u)));
		text-decoration: none;
	}

	nav a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: max(6px, calc(0.4 * var(--u)));
		text-decoration: none;
		font-weight: 700;
		font-size: max(1.375rem, calc(3.8 * var(--u)));
		letter-spacing: -0.01em;
	}

	.brand :global(.logo) {
		width: max(48px, calc(7.6 * var(--u)));
		margin-top: calc(-0.8 * var(--u));
	}

	/* Left: the headline, from 4.9% of the width. Right: the intro, from 65%. */
	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) calc(30.2 * var(--u));
		column-gap: calc(2.5 * var(--u));
		margin-top: max(16px, calc(1.6 * var(--u)));
	}

	h1 {
		font-size: max(2.625rem, calc(7.73 * var(--u)));
		line-height: 0.96;
		letter-spacing: -0.028em;
		text-wrap: auto;
	}

	.aside {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: calc(2 * var(--u));
		padding-top: calc(0.6 * var(--u));
		font-size: max(1.1875rem, calc(2.67 * var(--u)));
		line-height: 1.36;
	}

	.aside :global(.peek) {
		width: calc(17.5 * var(--u));
		margin-left: calc(5 * var(--u));
	}

	.install {
		display: grid;
		grid-template-columns: minmax(0, 63fr) minmax(0, 23.6fr);
		justify-content: space-between;
		column-gap: calc(3.2 * var(--u));
		margin-top: max(24px, calc(3.4 * var(--u)));
	}

	.command {
		display: flex;
		align-items: stretch;
		min-width: 0;
		border: 1.5px solid var(--rule-strong);
		background: var(--box);
	}

	code {
		flex: 1;
		min-width: 0;
		align-self: center;
		padding: calc(1.2 * var(--u)) calc(1.9 * var(--u));
		font-family: var(--mono);
		font-size: max(0.8125rem, calc(1.93 * var(--u)));
		white-space: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.copy {
		flex: none;
		display: grid;
		place-items: center;
		/* A fixed width, so that "Copied" and "Failed" do not move the command box. */
		width: max(4.5rem, calc(6 * var(--u)));
		border: 0;
		border-left: 1px solid var(--rule);
		background: none;
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}

	.copy svg {
		width: max(18px, calc(2.3 * var(--u)));
		height: auto;
	}

	.copy:hover {
		background: color-mix(in srgb, var(--ink) 6%, transparent);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.copied {
		font-family: var(--mono);
		font-size: max(0.8125rem, calc(1.4 * var(--u)));
		color: var(--sky-ink);
	}

	.download {
		display: grid;
		place-items: center;
		padding: calc(1 * var(--u)) calc(2 * var(--u));
		min-height: 44px;
		border: 1.5px solid var(--rule-strong);
		font-weight: 700;
		font-size: max(1.0625rem, calc(2.2 * var(--u)));
		text-decoration: none;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out;
	}

	.download:hover {
		background: var(--ink);
		color: var(--paper);
	}

	.soon {
		margin-top: max(24px, calc(4.2 * var(--u)));
		font-weight: 700;
		font-size: max(1.5rem, calc(3.2 * var(--u)));
	}

	.fine {
		margin-top: calc(1.4 * var(--u));
		font-style: italic;
		font-size: max(0.875rem, calc(1.65 * var(--u)));
		color: var(--ink-soft);
	}

	@media (max-width: 760px) {
		.lead,
		.install {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 16px;
		}

		/* The whole command shows on a phone: it wraps at its spaces. */
		code {
			white-space: normal;
			overflow-x: visible;
		}

		.aside :global(.peek) {
			display: none;
		}

		.fine {
			margin-top: 12px;
		}
	}
</style>
