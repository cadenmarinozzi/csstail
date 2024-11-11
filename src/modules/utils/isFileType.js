const jsFileNames = ['.js', '.jsx', '.mjs'];
const cssFileNames = ['.css', '.scss', '.sass'];

export const isJSFile = (fileName) => {
	return jsFileNames.some((extension) => fileName.endsWith(extension));
};

export const isCSSFile = (fileName) => {
	return cssFileNames.some((extension) => fileName.endsWith(extension));
};
