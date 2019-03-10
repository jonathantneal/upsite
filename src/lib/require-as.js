import { execSync } from 'child_process';
import path from 'path';
import resolve from 'resolve';

function resolveFrom(basedir, id) {
	return resolve.sync(id, { basedir });
}

export default function requireAs(id, opts) {
	const onInstall = typeof Object(opts).onInstall === 'function' ? opts.onInstall : () => {};
	const onInstalled = typeof Object(opts).onInstalled === 'function' ? opts.onInstalled : () => {};
	const onThrow = typeof Object(opts).onThrow === 'function' ? opts.onThrow : () => {};
	const saveAs = typeof Object(opts).saveAs === 'string' ? ` ${opts.saveAs.trim()}` : ' --save';

	try {
		// 1st, attempt to require the id as a package or filepath
		return require(resolveFrom(cwd, id));
	} catch (error) {
		try {
			// 2nd, attempt to require the id as a resolved filepath
			return require(path.resolve(id));
		} catch (error2) {
			try {
				if (!/^[.\/]/.test(id)) {
					// 3rd, attempt to install and require the id as a package
					onInstall(id);

					exec(`npm install${saveAs} ${id}`);

					onInstalled(id);

					const resolvedId = resolveFrom(cwd, id);

					try {
						return require(resolvedId);
					} catch (error3) {
						return () => { throw error3; };
					}
				} else {
					throw error;
				}
			} catch (error3) {
				// otherwise, throw the original error
				onThrow(error);
			}
		}
	}

	return null;
}

function exec(cmd) {
	return execSync(cmd, {
		stdio: [null, null, null],
		cwd
	});
}

const cwd = process.cwd();
