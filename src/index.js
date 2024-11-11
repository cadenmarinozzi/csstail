import colors from 'colors/safe.js';
import fs from 'fs';
import { isJSFile } from './modules/utils/isFileType.js';
import processJS from './modules/processing/processJS.js';

if (process.argv.length < 3) {
	console.log(colors.red('Please provide a target directory'));
	process.exit(1);
}

const targetDirectory = process.argv[2];

if (!fs.existsSync(targetDirectory)) {
	console.log(
		colors.red(`Target directory "${targetDirectory}" does not exist`)
	);
	process.exit(1);
}

const recurse = async (directory) => {
	console.log(colors.blue(`Processing ${directory}`));

	for (const fileName of fs.readdirSync(directory)) {
		const file = `${directory}/${fileName}`;

		// Recurse any directories further
		if (fs.lstatSync(file).isDirectory()) {
			await recurse(file);

			continue;
		}

		const content = fs.readFileSync(file).toString();

		if (isJSFile(fileName)) {
			await processJS(file, content);
		}
	}
};

recurse(targetDirectory);
