import fse from 'fse';

export default function touchAs(filename, fallbackData) {
	try {
		fse.openSync(filename, 'r');
	} catch (error) {
		if (error.code === 'ENOENT') {
			fse.writeFileSync(filename, fallbackData);
		}
	}
}
