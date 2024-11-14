import { isCSSFile } from '../../utils/isFileType.js';
import fs from 'fs';
import processCSS from '../css/index.js';

export const processCSSImport = async (importSource, filePath) => {
	// TODO: Does this change to a different type for require notation?
	// Process any css files found from an import

	const directory = filePath.split('/').slice(0, -1).join('/');
	const importFileName =
		importSource.indexOf('/') === 1
			? importSource.replace(/\.{1}\//, '')
			: importSource;

	const fullImportPath = `${directory}/${importFileName}`;
	const importContent = fs.readFileSync(fullImportPath).toString();

	return await processCSS(importContent);
};

export const processImports = async (ast, filePath) => {
	const rules = {};

	for (const [index, node] of Object.entries(ast)) {
		if (node.type !== 'ImportDeclaration') continue;

		const importSource = node.source.value;
		if (!isCSSFile(importSource)) continue;

		const ruleMap = await processCSSImport(importSource, filePath);
		rules[importSource] = ruleMap;

		// Remove the import node since we are no longer using that css file
		// delete ast[index];
	}

	return rules;
};
