<script lang="ts">
	import { releases, formatDate } from '../releases';
</script>

<section class="details page">
	<div class="requirements" data-testid="requirements">
		<h2>Requirements</h2>
		<ul>
			<li>macOS 26 or later</li>
			<li>Claude Code installed</li>
			<li>GitHub CLI (gh) signed in</li>
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
	/* Requirements 4.9%-41.5%, a rule at 43%, the changelog from 47.8%. */
	.details {
		display: grid;
		grid-template-columns: minmax(0, 40fr) minmax(0, 53fr);
		margin-top: calc(1.5 * var(--u));
		border-top: 1.5px solid var(--rule-strong);
		padding-block: max(24px, calc(2.6 * var(--u)));
	}

	.requirements {
		padding-right: calc(3 * var(--u));
	}

	.changelog {
		padding-left: calc(4.6 * var(--u));
		border-left: 1.5px solid var(--rule-strong);
	}

	h2 {
		font-size: max(1.75rem, calc(4.3 * var(--u)));
		letter-spacing: -0.015em;
	}

	ul,
	ol {
		margin: calc(1.6 * var(--u)) 0 0;
		padding: 0;
		font-size: max(1.0625rem, calc(2.16 * var(--u)));
		line-height: 1.38;
	}

	ul {
		padding-left: 1.4em;
	}

	ol {
		list-style: none;
	}

	ol li {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.45em;
		padding-block: calc(0.25 * var(--u));
		padding-left: 0.2em;
	}

	.version,
	time {
		font-variant-numeric: tabular-nums lining-nums;
	}

	.dot {
		color: var(--ink-soft);
	}

	.notes {
		white-space: pre-line;
	}

	.empty {
		margin-top: calc(1.6 * var(--u));
		font-style: italic;
		font-size: max(1.0625rem, calc(2.05 * var(--u)));
		color: var(--ink-soft);
	}

	@media (max-width: 760px) {
		.details {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 24px;
		}

		.requirements {
			padding-right: 0;
		}

		.changelog {
			padding-left: 0;
			padding-top: 24px;
			border-left: 0;
			border-top: 1px solid var(--rule);
		}
	}
</style>
