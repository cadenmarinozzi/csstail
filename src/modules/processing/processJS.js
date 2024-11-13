import { isCSSFile } from '../../modules/utils/isFileType.js';
import fs from 'fs';
import processCSS from './processCSS.js';
import * as babelParser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;
import _generate from '@babel/generator';
const generate = _generate.default;

const processCSSImport = async (importSource, filePath) => {
	// TODO: Does this change to a different type for require notation?
	// Process any css files found from an import

	const directory = filePath.split('/').slice(0, -1).join('/');
	const importFileName = importSource.replace('./', '');

	const fullImportPath = `${directory}/${importFileName}`;
	const importContent = fs.readFileSync(fullImportPath).toString();

	return await processCSS(fullImportPath, importContent);
};

export default async (filePath, content) => {
	const ast = babelParser.parse(content, {
		sourceType: 'module',
		plugins: ['jsx'],
	});

	const rules = {};

	// Process just the css imports
	for (let [index, node] of Object.entries(ast.program.body)) {
		if (node.type !== 'ImportDeclaration') continue;

		const importSource = node.source.value;
		if (!isCSSFile(importSource)) continue;

		const ruleMap = await processCSSImport(importSource, filePath);
		rules[importSource] = ruleMap;

		delete ast.program.body[index];
	}

	// Now apply the rules to convert
	traverse(ast, {
		JSXAttribute(path) {
			const node = path.node;

			if (node.name.name === 'className') {
				node.value.value = node.value.value
					.split(' ')
					.map((name) => {
						// Replace the css name with the tailwind declaration
						for (const style of Object.values(rules)) {
							for (const [
								identifier,
								declarations,
							] of Object.entries(style)) {
								const declaration =
									Object.values(declarations).join(' ');

								if (name === identifier) name = declaration;
							}
						}

						return name;
					})
					.join(' ');
			}
		},
	});

	const transformedCode = generate(ast, content).code;

	fs.renameSync(filePath, filePath + '.old');
	fs.writeFileSync(filePath, transformedCode);
};
