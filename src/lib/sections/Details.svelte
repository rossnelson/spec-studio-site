<script lang="ts">
	import { releases, formatDate } from '../releases';
</script>

<section class="details page">
	<div class="requirements" data-testid="requirements">
		<h2>Requirements</h2>
		<ul>
			<li>macOS 26 or later, on Apple silicon</li>
			<li>Claude Code installed</li>
			<li>GitHub CLI (<code>gh</code>) signed in</li>
		</ul>
	</div>

	<div class="changelog" data-testid="changelog">
		<h2>Changelog</h2>
		{#if releases.length === 0}
			<p class="empty">No release yet.</p>
		{:else}
			<ol>
				{#each releases as release (release.version)}
					<li data-testid="release">
						<span class="version">{release.version}</span>
						<span class="dot" aria-hidden="true">·</span>
						<time datetime={release.date}>{formatDate(release.date)}</time>
						<span class="dot" aria-hidden="true">·</span>
						<span class="notes">{release.notes}</span>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</section>

<style>
	.details {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		margin-top: clamp(32px, 5vw, 56px);
		padding-block: clamp(8px, 2vw, 16px) clamp(32px, 5vw, 56px);
		border-top: 1.5px solid var(--rule);
	}

	.details > div {
		padding-top: clamp(24px, 4vw, 40px);
	}

	.changelog {
		padding-left: clamp(24px, 4vw, 56px);
		border-left: 1px solid var(--hairline);
	}

	.requirements {
		padding-right: clamp(24px, 4vw, 56px);
	}

	h2 {
		font-size: clamp(1.875rem, 1.4rem + 1.6vw, 2.75rem);
		font-weight: 800;
	}

	ul,
	ol {
		margin: 16px 0 0;
		padding: 0;
	}

	ul {
		padding-left: 1.1em;
	}

	ul li + li {
		margin-top: 4px;
	}

	code {
		font-family: var(--mono);
		font-size: 0.88em;
	}

	ol {
		list-style: none;
	}

	ol li {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.5em;
		padding-block: 4px;
	}

	.version {
		font-family: var(--mono);
		font-size: 0.95em;
	}

	.dot {
		color: var(--ink-soft);
	}

	time {
		font-variant-numeric: tabular-nums;
	}

	.notes {
		white-space: pre-line;
	}

	.empty {
		margin-top: 16px;
		font-style: italic;
		color: var(--ink-soft);
	}

	@media (max-width: 760px) {
		.details {
			grid-template-columns: 1fr;
		}

		.requirements {
			padding-right: 0;
		}

		.changelog {
			padding-left: 0;
			border-left: 0;
			margin-top: 16px;
			border-top: 1px solid var(--hairline);
		}
	}
</style>
