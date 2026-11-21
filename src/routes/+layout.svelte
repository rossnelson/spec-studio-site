<script lang="ts">
	import '../app.css';
	import { asset } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={asset("favicon.png")} />
	<link rel="apple-touch-icon" href={asset("apple-touch-icon.png")} />
</svelte:head>

{@render children()}
