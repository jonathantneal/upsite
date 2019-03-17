import { required } from './util';

export default function normalizePlugins(plugins, pluginIdTransformer, requireOpts) {
	const requireCache = {};

	let promise = Promise.resolve();

	plugins.forEach((plugin, index) => {
		if (typeof plugin === 'string') {
			const expandedId = typeof pluginIdTransformer === 'function' ? pluginIdTransformer(plugin) : plugin;

			promise = promise.then(
				() => required(expandedId, requireOpts, requireCache).catch(() => required(plugin, requireOpts, requireCache))
			).then(exported => {
				plugins[index] = exported;
			}, () => {});
		} else if (Array.isArray(plugin) && typeof plugin[0] === 'string') {
			const expandedId = typeof pluginIdTransformer === 'function' ? pluginIdTransformer(plugin[0]) : plugin[0];

			promise = promise.then(
				() => required(expandedId, requireOpts, requireCache).catch(() => required(plugin[0], requireOpts, requireCache)).catch(() => plugin[0])
			).then(exported => {
				if (1 in plugin) {
					plugins[index] = typeof exported === 'function'
						? exported(plugin[1])
					: [exported, plugin[1]];
				}
			}, () => {});
		}
	});

	return promise.then(() => plugins);
}

export function normalizeBabelPluginId(id) {
	return id.replace(/^(@[^\/]+\/)(?!plugin)/, '$1plugin-').replace(/^(?!@|babel-plugin)/, 'babel-plugin-');
}

export function normalizeBabelPresetId(id) {
	return id.replace(/^(@[^\/]+\/)(?!preset)/, '$1preset-').replace(/^(?!@|babel-preset)/, 'babel-preset-');
}

export function normalizePhtmlPluginId(id) {
	return id.replace(/^(@(?!phtml)\/)(?!phtml)/, '$phtml-').replace(/^(?!@|phtml-)/, 'phtml-');
}

export function normalizePostcssPluginId(id) {
	return id.replace(/^(@[^\/]+\/)(?!postcss)/, '$1postcss-').replace(/^(?!@|postcss-)/, 'postcss-');
}
