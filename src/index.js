import colors from 'colors/safe.js';
import fs from 'fs';
import { isJSFile } from './modules/utils/isFileType.js';
import processJS from './modules/processing/js/index.js';
import { args } from './modules/cli/args.js';

const targetDirectory = args.targetPath;
const outPath = args.outPath;

// If saving, delete and create the out dir
if (!args.dontSave && args.notInPlace) {
	if (fs.existsSync(outPath)) {
		fs.rmSync(outPath, { recursive: true });
	}

	fs.mkdirSync(outPath);
}

const recurse = async (directory) => {
	const outDirectoryPath = `${outPath}/${directory}`;
	console.log(colors.blue(`Processing ${directory}`));

	if (!args.dontSave && args.notInPlace && !fs.existsSync(outDirectoryPath)) {
		fs.mkdirSync(outDirectoryPath);
	}

	for (const fileName of fs.readdirSync(directory)) {
		const file = `${directory}/${fileName}`;
		const outFilePath = `${outDirectoryPath}/${fileName}`;

		// Recurse any directories further
		if (fs.lstatSync(file).isDirectory()) {
			// Create the directory if writing to out dir
			if (
				!args.dontSave &&
				args.notInPlace &&
				!fs.existsSync(outFilePath)
			) {
				fs.mkdirSync(outFilePath);
			}

			await recurse(file);

			continue;
		}

		let content = fs.readFileSync(file).toString();

		if (isJSFile(fileName)) {
			content = await processJS(file, content);

			// Write in place
			if (!args.dontSave && !args.notInPlace) {
				fs.renameSync(filePath, filePath + '.old');
				fs.writeFileSync(filePath, content);
			}
		}

		// Write all files js or not to out dir
		if (!args.dontSave && args.notInPlace) {
			fs.writeFileSync(outFilePath, content);
		}
	}
};

recurse(targetDirectory);
