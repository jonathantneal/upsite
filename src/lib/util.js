import yamlLoader from 'js-yaml/lib/js-yaml/loader';
import child_process from 'child_process';
import fs from 'fs';
import parseAsJS from 'require-from-string';
import path from 'path';

const { safeLoad: parseAsYaml } = yamlLoader
const { parse: parseAsJSON } = JSON;
export const cwd = process.cwd();
const initialOpts = {
	cwd,
	entry: 'main',
	index: ['index.js', 'index.json'],
	npmInstallOptions: '--no-save',
	ext: ['js']
};

/* Require a module
/* ========================================================================== */

export function required (id, rawopts, rawcache) {
	const opts = { ...initialOpts, ...Object(rawopts) };
	const cache = Object(rawcache);

	return resolve_w_install(id, opts, cache).then(require_from_result);
}

export function require_config (id, rawopts, rawcache) {
	const opts = { ...initialOpts, ...Object(rawopts) };
	const cache = Object(rawcache);

	return get_cached_json_contents(opts.cwd, cache).then(
		// if `pkg` has the entry field
		pkg => id in pkg
			// resolve `pkg/id` as the config
			? Object(pkg[id])
		// otherwise, reject the package.json
		: Promise.reject()
	).catch(() => [
		`.${id}rc`,
		`.${id}rc.json`,
		`.${id}rc.yaml`,
		`.${id}rc.yml`,
		`.${id}rc.js`,
		`${id}.config.js`
	].reduce(
		(promise, file) => promise.catch(
			() => resolve_as_file(file, cache).then(require_from_result),
		),
		Promise.reject()
	)).catch(() => null);
}

/* Resolve the location of a module
/* ========================================================================== */

function resolve_w_install (id, rawopts, rawcache) {
	const opts = { ...initialOpts, ...Object(rawopts) };
	const cache = Object(rawcache);

	return resolve(id, opts, cache).catch(error => {
		if (!starts_with_relative(id)) {
			const cmd = `npm install ${opts.npmInstallOptions} ${id}`;

			if (typeof opts.onBeforeNpmInstall === 'function') {
				opts.onBeforeNpmInstall(id);
			}

			return exec(cmd, opts).then(
				() => {
					if (typeof opts.onAfterNpmInstall === 'function') {
						opts.onAfterNpmInstall(id);
					}

					return resolve_as_module(id, opts, cache);
				}
			)
		}

		throw error;
	})
}

function resolve (id, rawopts, rawcache) {
	const opts = { ...initialOpts, ...Object(rawopts) };
	const cache = Object(rawcache);

	// if `id` starts with `/` then `cwd` is the filesystem root
	opts.cwd = starts_with_root(id) ? '' : opts.cwd;

	return (
		// if `id` begins with `/`, `./`, or `../`
		starts_with_relative(id)
			// resolve as a path using `cwd/id` as `file`
			? resolve_as_path(path.join(opts.cwd, id), opts, cache)
		// otherwise, resolve as a module using `cwd` and `id`
		: resolve_as_module(id, opts, cache)
	// otherwise, throw "Module id could not be loaded"
	).catch(
		error => Promise.reject(Object.assign(new Error(`${id} could not be loaded`), error))
	);
}

/* Related tooling
/* ========================================================================== */

function resolve_as_path (id, opts, cache) {
	// resolve as a path using `cwd/id` as `file`
	return resolve_as_file(id, cache)
	// otherwise, resolve as a directory using `dir/id` as `dir`
	.catch(() => resolve_as_directory(id, opts, cache))
}

function resolve_as_file (file, cache) {
	return new Promise((resolvePromise, rejectPromise) => {
		fs.stat(
			file,
			(error, stats) => error
				? rejectPromise(error)
			: cache[file] && cache[file].mtimeMs === stats.mtimeMs
				? resolvePromise(cache[file])
			: resolvePromise(get_cached_file_contents(file, stats.mtimeMs, cache))
		)
	});
}

function resolve_as_directory (dir, opts, cache) {
	// resolve the JSON contents of `dir/package.json` as `pkg`
	return get_cached_json_contents(dir, cache).then(
		// if `pkg` has the entry field
		pkg => 'entry' in opts && opts.entry in pkg
			// resolve `dir/entry` as the file
			? resolve_as_path(path.join(dir, pkg[opts.entry]), opts, cache)
		// otherwise, resolve `dir/index` as the file
		: Promise.reject()
	).catch(error => {
		return opts.index.reduce(
			(promise, index) => promise.catch(
				() => resolve_as_file(path.join(dir, index), cache)
			),
			Promise.reject()
		).catch(() => opts.ext.reduce(
			(promise, ext) => promise.catch(
				() => resolve_as_file(dir + '.' + ext, cache)
			),
			Promise.reject(error)
		))
	})
}

function resolve_as_module (id, opts, cache) {
	// for each `dir` in the node modules directory using `cwd`
	return get_node_modules_dirs(opts.cwd).reduce(
		(promise, dir) => promise.catch(
			// resolve as a file using `dir/id` as `file`
			() => resolve_as_file(path.join(dir, id), cache)
			// otherwise, resolve as a directory using `dir/id` as `dir`
			.catch(() => resolve_as_directory(path.join(dir, id), opts, cache))
		),
		Promise.reject()
	);
}

function require_as_js_from_result (result) {
	return parseAsJS(result.contents, result.file);
}

function require_as_json_from_result (result) {
	return parseAsJSON(result.contents);
}

function require_as_yaml_from_result (result) {
	return parseAsYaml(result.contents, { filename: result.file });
}

function require_as_any_from_result (result) {
	try {
		return require_as_json_from_result(result);
	} catch (error1) {
		try {
			return require_as_yaml_from_result(result);
		} catch (error2) {
			try {
				return require_as_js_from_result(result);
			} catch (error3) {
				return result.contents;
			}
		}
	}
}

/* Supporting function
/* ========================================================================== */

function require_from_result (result) {
	const extname = path.extname(result.file).slice(1).toLowerCase();

	const requiredExport = extname === 'es6' || extname === 'js' || extname === 'mjs'
		? require_as_js_from_result(result)
	: extname === 'json'
		? require_as_json_from_result(result)
	: extname === 'yaml' || extname === 'yml'
		? require_as_yaml_from_result(result)
	: require_as_any_from_result(result);

	return requiredExport;
}

function get_node_modules_dirs (dir) {
	// segments is `dir` split by `/`
	const segments = dir.split(path.sep);

	// `count` is the length of segments
	let count = segments.length;

	// `dirs` is an empty list
	const dirs = [];

	// while `count` is greater than `0`
	while (count > 0) {
		// if `segments[count]` is not `node_modules`
		if (segments[count] !== 'node_modules') {
			// push a new path to `dirs` as the `/`-joined `segments[0 - count]` and `node_modules`
			dirs.push(
				path.join(segments.slice(0, count).join('/') || '/', 'node_modules')
			);
		}

		// `count` is `count` minus `1`
		--count;
	}

	// return `dirs`
	return dirs;
}

function get_cached_json_contents (dir, cache) {
	const file = path.join(dir, 'package.json');

	return resolve_as_file(file, cache).then(
		({ contents }) => parseAsJSON(contents)
	);
}

function get_cached_file_contents (file, mtimeMs, cache) {
	cache[file] = new Promise(
		(resolvePromise, rejectPromise) => fs.readFile(
			file,
			'utf8',
			(error, contents) => error
				? rejectPromise(error)
			: resolvePromise({ file, contents })
		)
	);

	cache[file].mtimeMs = mtimeMs;

	return cache[file];
}

function starts_with_root (id) {
	return /^\//.test(id);
}

function starts_with_relative (id) {
	return /^\.{0,2}\//.test(id);
}

export function exec(cmd, rawopts) {
	const opts = { ...initialOpts, ...Object(rawopts) };

	return new Promise((resolvePromise, rejectPromise) => {
		child_process.exec(cmd, {
			stdio: [null, null, null],
			cwd: opts.cwd
		}, (error, stdout) => {
			if (error) {
				rejectPromise(stdout);
			} else {
				resolvePromise(stdout);
			}
		});
	});
}
