<script lang="ts">
	import { asset } from '$app/paths';

	const stages = [
		{ id: 'spec', art: asset('stages/spec.webp'), name: 'Spec', text: 'Write the spec with Claude, one question at a time.', alt: 'The critter writes on a sheet of paper.' },
		{ id: 'plan', art: asset('stages/plan.webp'), name: 'Plan', text: 'Claude studies the code and plans each repo’s change and merge order.', alt: 'The critter reads an open map.' },
		{ id: 'build', art: asset('stages/build.webp'), name: 'Build', text: 'Claude builds in its own worktrees and opens draft PRs.', alt: 'The critter types at a laptop.' },
		{ id: 'check', art: asset('stages/check.webp'), name: 'Check', text: 'A self-review swarm and scenario checks prove each requirement.', alt: 'The critter holds a clipboard of check marks.' },
		{ id: 'merge', art: asset('stages/merge.webp'), name: 'Merge', text: 'Merge in order, clean up the worktrees, and the critter gets a party hat.', alt: 'The critter cheers in a party hat.' }
	];
</script>

<section class="stages page" aria-labelledby="stages-title">
	<h2 id="stages-title">Five stages.</h2>
	<ol>
		{#each stages as stage, i (stage.id)}
			<li data-testid="stage">
				<span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div class="copy">
					<h3>{stage.name}</h3>
					<p>{stage.text}</p>
				</div>
				<img src={stage.art} alt={stage.alt} width="300" height="200" loading="lazy" />
			</li>
		{/each}
	</ol>
</section>

<style>
	.stages {
		border-top: 1.5px solid var(--rule);
		padding-top: clamp(32px, 5vw, 56px);
	}

	h2 {
		font-size: clamp(2.25rem, 1.4rem + 3vw, 4rem);
		font-weight: 800;
	}

	ol {
		list-style: none;
		margin: clamp(16px, 3vw, 32px) 0 0;
		padding: 0;
	}

	li {
		display: grid;
		grid-template-columns: clamp(72px, 10vw, 140px) minmax(0, 1fr) clamp(140px, 22vw, 260px);
		align-items: center;
		gap: clamp(16px, 3vw, 40px);
		padding-block: clamp(14px, 2vw, 22px);
		border-bottom: 1px solid var(--hairline);
	}

	.num {
		font-family: var(--display);
		font-weight: 700;
		font-size: clamp(3rem, 2rem + 3.5vw, 5.5rem);
		line-height: 1;
		color: var(--tan);
		font-variant-numeric: lining-nums;
		padding-right: clamp(12px, 2vw, 28px);
		border-right: 1.5px solid var(--rule);
		align-self: stretch;
		display: flex;
		align-items: center;
	}

	h3 {
		font-size: clamp(1.75rem, 1.3rem + 1.6vw, 2.75rem);
		font-weight: 800;
	}

	.copy p {
		margin-top: 4px;
		max-width: 38ch;
	}

	img {
		width: 100%;
	}

	@media (max-width: 640px) {
		li {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas: 'num copy' 'art art';
		}

		.num {
			grid-area: num;
		}

		.copy {
			grid-area: copy;
		}

		img {
			grid-area: art;
			max-width: 240px;
			justify-self: end;
		}
	}
</style>
