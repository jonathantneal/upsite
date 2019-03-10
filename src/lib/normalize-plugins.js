import requireAs from './require-as';

export default function normalizePlugins(plugins, pluginIdTransformer, requireOpts) {
	if (typeof Object(plugins).forEach === 'function') {
		plugins.forEach((plugin, index) => {
			if (typeof plugin === 'string') {
				const expandedId = typeof pluginIdTransformer === 'function' ? pluginIdTransformer(plugin) : plugin;

				plugins[index] = requireAs(expandedId, requireOpts) || requireAs(plugin, requireOpts) || plugin;
			} else if (Array.isArray(plugin) && typeof plugin[0] === 'string') {
				const expandedId = typeof pluginIdTransformer === 'function' ? pluginIdTransformer(plugin[0]) : plugin[0];

				plugins[index] = requireAs(expandedId, requireOpts) || requireAs(plugin[0], requireOpts) || plugin[0];

				if (1 in plugin) {
					plugins[index] = typeof plugins[index] === 'function'
						? plugins[index](plugin[1])
					: [plugins[index], plugin[1]];
				}
			}
		});
	}
}
