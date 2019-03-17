import fse from 'fse';
import mimeTypes from 'mime-types';
import path from 'path';

export default function getPathStats(...pathnames) {
	const pathname = path.join(...pathnames);

	return fse.stat(pathname).then(stats => {
		if (stats.isDirectory()) {
			return getPathStats(path.join(pathname, 'index.html'));
		}

		const date = new Date().toUTCString();
		const extname = path.extname(pathname).slice(1).toLowerCase();
		const lastModified = new Date(stats.mtimeMs).toUTCString();
		const contentType = mimeTypes.contentType(extname);

		return Object.assign(stats, { contentType, date, extname, lastModified, pathname });
	});
}
