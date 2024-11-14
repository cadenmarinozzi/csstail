import fs from 'fs';
import * as babelParser from '@babel/parser';
import { args } from '../../cli/args.js';
import { applyRulesToAST } from './transform.js';
import { processImports } from './process.js';

import _generate from '@babel/generator';
const generate = _generate.default;

export default async (filePath, content) => {
	const ast = babelParser.parse(content, {
		sourceType: 'module',
		plugins: ['jsx'],
	});

	// Process just the css imports
	const rules = await processImports(ast.program.body, filePath);
	applyRulesToAST(ast, rules);

	const transformedCode = generate(ast, content).code;

	return transformedCode;
};
