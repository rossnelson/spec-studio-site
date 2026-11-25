<script lang="ts">
	import { videoFigure, type VideoName } from './videos';

	let { name = 'app', class: className = '' }: { name?: VideoName; class?: string } = $props();
</script>

<!-- The markup comes from videoFigure, which the guides use too. -->
<div class={className}>{@html videoFigure(name)}</div>
