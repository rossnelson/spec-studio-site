/**
 * A Svelte attachment for a guide: each `[data-copy]` button copies the
 * code of its block. The button says "Copied" (or "Failed") for 2 seconds,
 * and a status line tells a screen reader.
 */
export function copyButtons(root: HTMLElement) {
	const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

	async function onClick(event: MouseEvent) {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
		if (!button) return;
		const block = button.closest<HTMLElement>('[data-copy-block]');
		const code = block?.querySelector('code')?.textContent ?? '';
		const status = block?.querySelector<HTMLElement>('[data-copy-status]');
		// Clear the status first, so a second copy is announced again.
		if (status) status.textContent = '';
		let label: string;
		try {
			await navigator.clipboard.writeText(code.replace(/\n$/, ''));
			label = 'Copied';
		} catch {
			label = 'Failed';
		}
		button.textContent = label;
		if (status) status.textContent = label === 'Copied' ? 'Copied to the clipboard.' : 'The copy failed.';
		clearTimeout(timers.get(button));
		timers.set(
			button,
			setTimeout(() => {
				button.textContent = 'Copy';
				if (status) status.textContent = '';
			}, 2000)
		);
	}

	root.addEventListener('click', onClick);
	return () => {
		root.removeEventListener('click', onClick);
		for (const timer of timers.values()) clearTimeout(timer);
	};
}
