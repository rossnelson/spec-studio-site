<script lang="ts">
	import { asset } from '$app/paths';
	import Sketch from '../Sketch.svelte';

	const stages = [
		{
			id: 'spec',
			light: asset('stages/spec.webp'),
			dark: asset('stages/spec-dark.webp'),
			name: 'Spec',
			text: 'Write the spec with Claude, one question at a time.',
			alt: 'The critter writes on a sheet of paper.'
		},
		{
			id: 'plan',
			light: asset('stages/plan.webp'),
			dark: asset('stages/plan-dark.webp'),
			name: 'Plan',
			text: 'Claude studies the code and plans each repo’s change and merge order.',
			alt: 'The critter reads an open map.'
		},
		{
			id: 'build',
			light: asset('stages/build.webp'),
			dark: asset('stages/build-dark.webp'),
			name: 'Build',
			text: 'Claude builds in its own worktrees and opens draft PRs.',
			alt: 'The critter types at a laptop.'
		},
		{
			id: 'check',
			light: asset('stages/check.webp'),
			dark: asset('stages/check-dark.webp'),
			name: 'Check',
			text: 'A self-review swarm and scenario checks prove each requirement.',
			alt: 'The critter holds a clipboard of check marks.'
		},
		{
			id: 'merge',
			light: asset('stages/merge.webp'),
			dark: asset('stages/merge-dark.webp'),
			name: 'Merge',
			text: 'Merge in order, clean up the worktrees, and the critter gets a party hat.',
			alt: 'The critter cheers in a party hat.'
		}
	];
</script>

<section class="stages page" aria-labelledby="stages-title">
	<h2 id="stages-title">Five stages. One calm window.</h2>
	<ol>
		{#each stages as stage, i (stage.id)}
			<li data-testid="stage">
				<span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div class="copy">
					<h3>{stage.name}</h3>
					<p>{stage.text}</p>
				</div>
				<Sketch class="art" light={stage.light} dark={stage.dark} alt={stage.alt} width={600} height={400} loading="lazy" />
			</li>
		{/each}
	</ol>
</section>

<style>
	.stages {
		margin-top: max(28px, calc(3.2 * var(--u)));
		border-top: 1.5px solid var(--rule-strong);
		padding-top: max(24px, calc(2.6 * var(--u)));
	}

	h2 {
		font-size: max(2rem, calc(6.05 * var(--u)));
		letter-spacing: -0.02em;
	}

	ol {
		list-style: none;
		margin: calc(0.6 * var(--u)) 0 0;
		padding: 0;
	}

	/* Numeral 5%-18%, a short rule at 18.4%, text from 21.5%, sketch at the right. */
	li {
		display: grid;
		grid-template-columns: calc(13 * var(--u)) minmax(0, 1fr) calc(20 * var(--u));
		align-items: center;
		
		min-height: calc(11.5 * var(--u));
		padding-block: calc(0.3 * var(--u));
		border-bottom: 1px solid var(--rule);
	}

	li:last-child {
		border-bottom: 0;
	}

	.num {
		position: relative;
		align-self: center;
		font-weight: 650;
		font-size: max(2.75rem, calc(9.7 * var(--u)));
		line-height: 1;
		color: var(--tan);
		font-variant-numeric: lining-nums;
		letter-spacing: -0.02em;
		margin-left: calc(0.4 * var(--u));
	}

	/* The short vertical rule between the numeral and the text. */
	.num::after {
		content: '';
		position: absolute;
		left: calc(13.4 * var(--u));
		top: 12%;
		height: 76%;
		border-left: 1.5px solid var(--rule-strong);
	}

	.copy {
		padding-left: calc(3.2 * var(--u));
		padding-right: calc(2 * var(--u));
	}

	h3 {
		font-size: max(1.5rem, calc(4.33 * var(--u)));
		letter-spacing: -0.01em;
	}

	.copy p {
		margin-top: calc(0.3 * var(--u));
		font-size: max(1.0625rem, calc(2.2 * var(--u)));
		line-height: 1.2;
		max-width: calc(48.5 * var(--u));
	}

	li :global(.art) {
		width: calc(16 * var(--u));
		margin-block: calc(-0.4 * var(--u));
		justify-self: end;
	}

	@media (max-width: 640px) {
		li {
			grid-template-columns: 64px minmax(0, 1fr);
			grid-template-areas: 'num copy' '. art';
			row-gap: 8px;
			padding-block: 16px;
		}

		.num {
			grid-area: num;
		}

		.num::after {
			display: none;
		}

		.copy {
			grid-area: copy;
			padding: 0;
		}

		li :global(.art) {
			grid-area: art;
			width: 200px;
		}
	}
</style>
