import cssToTailwind from '../../OpenAI/completions/cssToTailwind.js';
import { Cache } from '../../cache/index.js';
import colors from 'colors/safe.js';

const cache = new Cache();

export const processNode = async (node) => {
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
				if (value.type === 'function') {
					const functionName = value.value[0].value;
					const functionArgs = value.value[1].value
						.map((data) => {
							return data.value;
						})
						.join('');
					declarationStatement += `${functionName}(${functionArgs})`;
				} else {
					declarationStatement += value.value;
				}
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
	} else {
		cache.set(declarationStatement, tailwindStatement);
	}

	return [declarationStatement, tailwindStatement];
};

export const processRule = async (rule) => {
	// Process identifier
	const selector = rule.value[0].value;
	const selectorStatement = selector[0];

	let identifier;

	if (selectorStatement.type === 'class') {
		identifier = selectorStatement.value[0].value; // .class-name without the period
	} else if (selectorStatement.type === 'identifier') {
		identifier = selectorStatement.value;
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

	const declaration = Object.values(declarationMap).join(' ');

	return [identifier, declaration];
};
