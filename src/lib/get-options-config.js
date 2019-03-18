import { required, require_config as readConfig } from './util';
import msgs from './messages';
import configs from './configs';
import touchFileAs, { touchPackageJson } from './touch-file-as';

export default function getConfigOpts(opts, initialConfig, cache) {
	// get the specified config or the default config
	const configOpts = {
		...configs.default,
		...Object(
			initialConfig ||
			configs[opts.config] ||
			(
				Object(opts.config) === opts.config
					? opts.config
				: {}
			)
		)
	};

	Object.assign(configOpts, opts, {
		config: configOpts.config || {},
		dir: Object(initialConfig).dir || opts.dir
	});

	// normalize config uses as an array
	configOpts.uses = [].concat(configOpts.uses || []).map(
		use => Object.assign(Object(use), { readConfig })
	);

	let usePromise = Promise.resolve();

	configOpts.uses.forEach(use => {
		// install and require modules requested by the use
		const requireNames = Object.keys(Object(use.require));

		if (requireNames.length) {
			usePromise = usePromise.then(touchPackageJson);

			requireNames.forEach(name => {
				const id = use.require[name];

				usePromise = usePromise.then(
					() => required(id, {
						npmInstallOptions: '--save-dev',
						onBeforeNpmInstall: msgs.isInstalling
					}, cache).then(requiredExport => {
						use.require[name] = requiredExport;
					})
				);
			});
		}

		// run the config function
		if (typeof use.config === 'function') {
			usePromise = usePromise.then(
				() => use.config(use, opts)
			).then(config => {
				Object.assign(use, { config });
			});
		}
	});

	// touch any files requested by the config
	Object.keys(Object(configOpts.touch)).forEach(filename => {
		const normalizedFilename = normalizeFilename(filename, opts);

		usePromise = usePromise.then(
			() => touchFileAs(normalizedFilename, configOpts.touch[filename])
		);
	});

	return usePromise.then(() => configOpts);
}

function normalizeFilename(filename, opts) {
	return filename.replace(/\$\{(\w+)\}/g, ($0, $1) => {
		return $1 in opts ? opts[$1] : $0;
	});
}
