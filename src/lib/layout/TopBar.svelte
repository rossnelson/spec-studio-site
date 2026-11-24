<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import Sketch from '../Sketch.svelte';
</script>

<!-- The bar at the top of the guide pages: the brand and the nav. -->
<header class="bar page">
	<a class="brand" href={resolve('/')}>
		<Sketch class="logo" light={asset('logo.png')} dark={asset('logo-dark.png')} alt="" width={256} height={256} />
		<span>Spec Studio</span>
	</a>
	<nav aria-label="Site">
		<a href={resolve('/guides')}>Guides</a>
	</nav>
</header>

<style>
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-block: max(16px, calc(2 * var(--u)));
		border-bottom: 1.5px solid var(--rule-strong);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		text-decoration: none;
		font-weight: 700;
		font-size: max(1.25rem, calc(2.4 * var(--u)));
	}

	.brand :global(.logo) {
		width: max(40px, calc(4.4 * var(--u)));
	}

	nav a {
		font-size: max(1.0625rem, calc(1.95 * var(--u)));
		text-decoration: none;
	}

	nav a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
