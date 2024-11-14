import { parse } from 'scss-parser';
import { Cache } from '../../cache/index.js';
import { processRule } from './process.js';

const cache = new Cache();

export default async (content) => {
	const ast = parse(content);

	const ruleMap = {};

	for (const rule of ast.value) {
		if (rule.type !== 'rule') continue;

		const [identifier, declarationMap] = await processRule(rule);
		ruleMap[identifier] = declarationMap;
	}

	cache.write();

	return ruleMap;
};
