import _traverse from '@babel/traverse';
const traverse = _traverse.default;

export const applyRuleToElement = (node, rules) => {
	const elementType = node.openingElement.name.name;

	for (const style of Object.values(rules)) {
		for (const [identifier, declaration] of Object.entries(style)) {
			for (const attribute of node.openingElement.attributes) {
				if (attribute.name.name !== 'className') {
					continue;
				}

				// For class based
				attribute.value.value = attribute.value.value
					.split(' ')
					.map((name) => {
						return name === identifier ? declaration : name;
					})
					.join(' ');

				// For element based
				if (identifier === elementType) {
					attribute.value.value = `${attribute.value.value} ${declaration}`;
				}
			}
		}
	}
};

export const applyRulesToAST = (ast, rules) => {
	traverse(ast, {
		JSXElement(path) {
			applyRuleToElement(path.node, rules);
		},
	});
};
