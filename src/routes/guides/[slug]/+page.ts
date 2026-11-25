import { error } from '@sveltejs/kit';
import { guide, guides } from '../../../lib/guides';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => guides.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const found = guide(params.slug);
	if (!found) error(404, 'No such guide');
	const at = guides.findIndex((g) => g.slug === found.slug);
	return { guide: found, next: guides[at + 1] };
};
