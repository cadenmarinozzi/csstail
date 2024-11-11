import { Parser } from 'acorn';
import acornJSX from 'acorn-jsx';
import { isCSSFile } from '../../modules/utils/isFileType.js';
import fs from 'fs';
import processCSS from './processCSS.js';

const jsxParser = Parser.extend(acornJSX());

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
	const ast = jsxParser.parse(content, {
		sourceType: 'module',
		ecmaVersion: '2020',
	});

	const rules = {};

	// Process just the css imports
	for (const [index, node] of Object.entries(ast.body)) {
		if (node.type !== 'ImportDeclaration') continue;

		const importSource = node.source.value;
		if (!isCSSFile(importSource)) continue;

		const ruleMap = await processCSSImport(importSource, filePath);
		rules[importSource] = ruleMap;

		content = content.slice(0, node.start) + content.slice(node.end);
	}

	// Now apply the rules to convert

	for (const style of Object.values(rules)) {
		for (const [identifier, declarations] of Object.entries(style)) {
			const declaration = Object.values(declarations).join(' ');

			content = content.replaceAll(identifier, declaration);
		}
	}

	fs.renameSync(filePath, filePath + '.old');
	fs.writeFileSync(filePath, content);
};
