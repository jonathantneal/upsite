import manageTemplateTouch from './manage-template-touch';
import msgs from './messages';
import normalizePlugins from './normalize-plugins';
import templates from './templates';

export default function manageOptions(opts, argo) {
	const template = templates[argo.template] || (Object(argo.template) === argo.template ? argo.template : templates.default);

	const templatePlugins = {
		html: Array.from(Object(template.html).plugins || []),
		css: Array.from(Object(template.css).plugins || []),
		js: Array.from(Object(template.js).plugins || [])
	};
	const templatePresets = {
		js: Array.from(Object(template.js).presets || [])
	};

	manageTemplateTouch(template, argo);

	const installedPlugins = [];
	const requiredOpts = {
		saveAs: '--save',
		onInstall(id) { console.log(msgs.isInstalling(id)) },
		onInstalled(id) { installedPlugins.push(id); }
	};

	// Manage HTML
	if (Array.isArray(opts.html.plugins)) {
		opts.html.plugins.unshift(...templatePlugins.html);

		if (opts.html.plugins.length) {
			normalizePlugins(
				opts.html.plugins,
				id => id.replace(/^(@(?!phtml)\/)(?!phtml)/, '$phtml-').replace(/^(?!@|phtml-)/, 'phtml-'),
				requiredOpts
			);
		}
	}

	// Manage CSS
	if (Array.isArray(opts.css.plugins)) {
		opts.css.plugins.unshift(...templatePlugins.css);

		if (opts.css.plugins.length) {
			normalizePlugins(
				opts.css.plugins,
				id => id.replace(/^(@[^\/]+\/)(?!postcss)/, '$1postcss-').replace(/^(?!@|postcss-)/, 'postcss-'),
				requiredOpts
			);
		} else {
			// supress plugin warnings
			opts.css.plugins = [() => {}];
		}
	}

	if ('map' in Object(template.css)) {
		opts.css.map = template.css.map;
	}

	// Manage JS
	if (Array.isArray(opts.js.plugins)) {
		opts.js.plugins.unshift(...templatePlugins.js);

		if (opts.js.plugins.length) {
			normalizePlugins(
				opts.js.plugins,
				id => id.replace(/^(@[^\/]+\/)(?!plugin)/, '$1plugin-').replace(/^(?!@|babel-plugin)/, 'babel-plugin-'),
				requiredOpts
			);
		}
	}

	opts.js.presets = opts.js.presets || [];

	if (Array.isArray(opts.js.presets)) {
		opts.js.presets.unshift(...templatePresets.js);

		if (opts.js.presets.length) {
			normalizePlugins(
				opts.js.presets,
				id => id.replace(/^(@[^\/]+\/)(?!preset)/, '$1preset-').replace(/^(?!@|babel-preset)/, 'babel-preset-'),
				requiredOpts
			);
		}
	}

	if ('sourceMaps' in Object(template.js)) {
		opts.js.sourceMaps = template.js.sourceMaps;
	}

	manageOnEvents(opts, template);
}

function manageOnEvents(opts, template) {
	if ('onHTML' in template) {
		opts.onHTML = template.onHTML;
	}

	if ('onCSS' in template) {
		opts.onCSS = template.onCSS;
	}

	if ('onJS' in template) {
		opts.onJS = template.onJS;
	}
}
