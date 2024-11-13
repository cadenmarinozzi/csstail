import fs from 'fs';

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

		this.data = JSON.parse(fs.readFileSync(this.path));
	};
}
