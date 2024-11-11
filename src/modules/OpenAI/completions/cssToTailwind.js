import { createCompletion } from '../index.js';

export default async (prompt) => {
	return await createCompletion(
		[
			{
				role: 'system',
				content:
					'Given a css declaration, generate only the tailwind equivalent of it and nothing else. You may use arbitrary values. If there is no equal, return nothing.',
			},
			{
				role: 'user',
				content: 'margin-inline: 2rem',
			},
			{
				role: 'assistant',
				content: 'mx-[2rem]',
			},
			{
				role: 'user',
				content: prompt,
			},
		],
		100
	);
};
