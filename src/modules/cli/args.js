import fs from 'fs';
import colors from 'colors/safe.js';

const ARGUMENT_SEPARATION_REGEX = /([^=\s]+)=?\s*(.*)/;

const key = {
	targetPath: {
		checkExists: true,
		required: true,
	},
	outPath: {},
};

const parseArg = (arg, index) => {
	arg = arg.match(ARGUMENT_SEPARATION_REGEX);
	arg.splice(0, 1);

	let name = arg[0];

	// ordered args
	if (name.indexOf('-') !== 0) {
		const [keyName, keyOptions] = Object.entries(key)[index];

		if (keyOptions.checkExists && !fs.existsSync(name)) {
			console.log(
				colors.red(`The file or directory "${name}" does not exist`)
			);
			process.exit(1);
		}

		return [keyName, name];
	}

	// Remove - or --
	name = name.slice(name.slice(0, 2).lastIndexOf('-') + 1);

	// Parse argument value or set it to `true` if empty
	const value =
		arg[1] !== ''
			? parseFloat(arg[1]).toString() === arg[1]
				? +arg[1]
				: arg[1]
			: true;

	return [name, value];
};

const parseArgv = (argv) => {
	// Removing node/bin and called script name
	argv = argv.slice(2);

	const args = Object.fromEntries(argv.map(parseArg));

	for (const [keyName, keyOptions] of Object.entries(key)) {
		if (!args[keyName] && keyOptions.required) {
			console.log(colors.red(`Please specify a ${keyName}`));
			process.exit(1);
		}
	}

	return args;
};

export const args = parseArgv(process.argv);
