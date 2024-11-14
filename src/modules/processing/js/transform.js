import _traverse from '@babel/traverse';
const traverse = _traverse.default;

export const applyRuleToValue = (value, identifier, declaration) => {
	return value
		.split(' ')
		.map((name) => {
			return name === identifier ? declaration : name;
		})
		.join(' ');
};

export const applyRuleToConditionalExpression = (
	expression,
	identifier,
	declaration
) => {
	expression.test.name = applyRuleToValue(expression.test.name);
	expression.test.loc.identifierName = applyRuleToValue(
		expression.test.loc.identifierName
	);

	expression.consequent.value = applyRuleToValue(expression.consequent.value);

	// Maybe do extra.raw and extra.rawValue?

	if (expression.alternate?.type === 'ConditionalExpression') {
		applyRuleToConditionalExpression(
			expression.alternate,
			identifier,
			declaration
		);
	}
};

export const applyRulesToElement = (node, rules) => {
	const elementType = node.openingElement.name.name;

	for (const style of Object.values(rules)) {
		for (const [identifier, declaration] of Object.entries(style)) {
			for (const attribute of node.openingElement.attributes) {
				// Don't process JSXSpreadAttribute or something that isnt a className
				if (
					attribute.type !== 'JSXAttribute' ||
					attribute.name.name !== 'className'
				) {
					continue;
				}

				const value = attribute.value;

				if (typeof value.value === 'string') {
					// For class based
					value.value = applyRuleToValue(
						value.value,
						identifier,
						declaration
					);

					// For element based
					if (identifier === elementType) {
						value.value = `${value.value} ${declaration}`;
					}
				} else {
					// TemplateLiteral
					const expression = value.expression;

					if (expression?.type === 'TemplateLiteral') {
						for (const node of expression.expressions) {
							if (node.type !== 'ConditionalExpression') {
								continue;
							}
							applyRuleToConditionalExpression(
								node,
								identifier,
								declaration
							);
						}
						for (const element of expression.quasis) {
							element.value.raw = element.value.cooked =
								applyRuleToValue(
									element.value.raw,
									identifier,
									declaration
								);
						}
					}
				}
			}
		}
	}
};

export const applyRulesToAST = (ast, rules) => {
	traverse(ast, {
		JSXElement(path) {
			applyRulesToElement(path.node, rules);
		},
	});
};
