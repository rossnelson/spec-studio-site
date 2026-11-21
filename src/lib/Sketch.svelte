<script lang="ts">
	/**
	 * A sketch in two versions: black ink lines for the light theme and cream
	 * ink lines for the dark theme. The browser picks one from the system
	 * setting, with no JavaScript, so the first paint is right.
	 */
	let {
		light,
		dark,
		alt,
		width,
		height,
		class: className = '',
		loading = 'eager'
	}: {
		light: string;
		dark?: string;
		alt: string;
		width: number;
		height: number;
		class?: string;
		loading?: 'eager' | 'lazy';
	} = $props();
</script>

<picture class={className}>
	{#if dark}<source srcset={dark} media="(prefers-color-scheme: dark)" />{/if}
	<img src={light} {alt} {width} {height} {loading} data-sketch />
</picture>

<style>
	picture {
		display: block;
	}

	img {
		width: 100%;
		height: auto;
	}
</style>
