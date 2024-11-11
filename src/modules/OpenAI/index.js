import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

const openai = new OpenAI();

export const createCompletion = async (messages, maxTokens) => {
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages,
		max_completion_tokens: maxTokens,
	});

	return completion.choices[0].message.content;
};
