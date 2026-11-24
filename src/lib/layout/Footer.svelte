<script lang="ts">
	import { resolve } from '$app/paths';
	import { releasesUrl } from '../releases';
</script>

<footer class="page" data-testid="footer">
	<span class="name">Spec Studio</span>
	<a href={resolve('/guides')}>Guides</a>
	<a href={releasesUrl}>Releases</a>
</footer>

<style>
	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: calc(2.4 * var(--u));
		row-gap: 8px;
		padding-block: max(16px, calc(2 * var(--u))) max(32px, calc(4 * var(--u)));
		border-top: 1.5px solid var(--rule-strong);
		font-size: max(1rem, calc(1.95 * var(--u)));
	}

	.name {
		font-weight: 700;
		padding-right: calc(2.4 * var(--u));
		border-right: 1.5px solid var(--rule-strong);
	}

	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
