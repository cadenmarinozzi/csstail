import fs from 'fs';
import colors from 'colors/safe.js';

export class Cache {
	constructor(path = './cache.json') {
		this.path = path;
		this.data = {};

		this.read();
	}

	set = (key, value) => {
		this.data[key] = value;
	};

	get = (key) => {
		return this.data[key];
	};

	write = () => {
		fs.writeFileSync(this.path, JSON.stringify(this.data));
	};

	read = () => {
		if (!fs.existsSync(this.path)) return;

		try {
			this.data = JSON.parse(fs.readFileSync(this.path));
		} catch {
			console.log(colors.yellow('Unable to read cache file'));
		}
	};
}
