import fse from 'fse';

export default function touchFileAs(filename, fallbackData) {
	return fse.open(filename, 'r').catch(error => {
		if (error.code === 'ENOENT') {
			return fse.writeFile(filename, typeof fallbackData === 'function' ? fallbackData() : fallbackData);
		}

		throw error;
	});
}

export function touchPackageJson() {
	return touchFileAs('package.json', JSON.stringify({ private: true }, null, '  '));
}
