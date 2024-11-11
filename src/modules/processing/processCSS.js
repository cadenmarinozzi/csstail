import cssToTailwind from '../../modules/OpenAI/completions/cssToTailwind.js';
import { parse } from 'scss-parser';
import { Cache } from '../cache/index.js';

const cache = new Cache();

const processNode = async (node) => {
	if (node.type !== 'declaration') {
		return [];
	}

	let declarationStatement = '';

	for (const statement of node.value) {
		if (statement.type === 'property') {
			const identifier = statement.value[0].value; // color or padding etc
			declarationStatement += identifier + ':';

			continue;
		}

		if (statement.type === 'value') {
			for (const value of statement.value) {
				declarationStatement += value.value;
			}
		}
	}

	const tailwindStatement =
		cache.get(declarationStatement) ||
		(await cssToTailwind(declarationStatement));

	if (!tailwindStatement) {
		console.log(
			colors.yellow(
				`Unable to generate equivalent tailwind statement for: ${declarationStatement}`
			)
		);
	}

	cache.set(declarationStatement, tailwindStatement);

	return [declarationStatement, tailwindStatement];
};

const processRule = async (rule) => {
	// Process identifier
	const selector = rule.value[0].value;
	const selectorStatement = selector[0];

	let identifier;

	if (selectorStatement.type === 'class') {
		identifier = selectorStatement.value[0].value; // .class-name without the period
	}

	if (!identifier) {
		console.log(
			colors.yellow('Could not find an identifier for this selector')
		);

		return;
	}

	let declarationMap = {};

	const block = rule.value[1].value;

	for (const node of block) {
		const [declarationStatement, tailwindStatement] = await processNode(
			node
		);

		if (!declarationStatement || !tailwindStatement) {
			continue;
		}

		declarationMap[declarationStatement] = tailwindStatement;
	}

	return [identifier, declarationMap];
};

export default async (filePath, content) => {
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
