import msgs from './messages';
import path from 'path';
import normalizePlugins, { normalizeBabelPluginId, normalizeBabelPresetId, normalizePhtmlPluginId, normalizePostcssPluginId } from './configs-normalize';
import { touchPackageJson } from './touch-file-as';

const requiredOpts = {
	npmInstallOptions: '--save-dev',
	onBeforeNpmInstall: msgs.isInstalling
};

/* Uses for Phtml
/* ========================================================================== */

const usePhtml = {
	extensions: ['htm', 'html', 'phtml'],
	require: {
		phtml: 'phtml'
	},
	config(use) {
		return touchPackageJson().then(
			() => use.readConfig('phtml')
		).then(
			nextConfig => ({
				plugins: [
					['@phtml/doctype', {
						safe: true
					}],
					'@phtml/include',
					'@phtml/jsx',
					'@phtml/markdown',
					'@phtml/schema',
					'@phtml/self-closing'
				],
				...Object(nextConfig)
			})
		).then(
			nextConfig => normalizePlugins(
				nextConfig.plugins || [],
				normalizePhtmlPluginId,
				requiredOpts
			).then(normalizedPlugins => ({
				...nextConfig,
				plugins: normalizedPlugins
			}))
		);
	},
	write(use, stats) {
		// configure phtml process options
		const processOpts = { ...use.config, from: stats.pathname };

		delete processOpts.plugins;

		return use.require.phtml.use(use.config.plugins).process(stats.source, processOpts).then(
			result => result.html
		);
	}
};

/* Uses for PostCSS
/* ========================================================================== */

const usePostcss = {
	extensions: ['css', 'pcss'],
	require: {
		postcss: 'postcss'
	},
	config(use) {
		return touchPackageJson().then(
			() => use.readConfig('postcss')
		).then(
			nextConfig => ({
				plugins: [
					'import',
					['preset-env', {
						stage: 0
					}]
				],
				map: {
					inline: true
				},
				...Object(nextConfig)
			})
		).then(
			nextConfig => normalizePlugins(
				nextConfig.plugins || [],
				normalizePostcssPluginId,
				requiredOpts
			).then(normalizedPlugins => ({
				...nextConfig,
				plugins: normalizedPlugins
			}))
		);
	},
	write(use, stats) {
		// configure postcss process options
		const processOpts = { ...use.config, from: stats.pathname, to: stats.pathname };

		delete processOpts.plugins;

		const plugins = use.config.plugins.length ? use.config.plugins : [() => {}];

		// process the source using postcss
		return use.require.postcss(plugins).process(stats.source, processOpts).then(
			result => result.css
		);
	}
};

/* Uses for JSX
/* ========================================================================== */

const useJsx = {
	extensions: ['js', 'jsx'],
	require: {
		babel: '@babel/core'
	},
	config(use) {
		return touchPackageJson().then(
			() => use.readConfig('babel')
		).then(
			nextConfig => ({
				plugins: [
					['@babel/plugin-transform-react-jsx', {
						pragma: '$',
						pragmaFrag: '$',
						useBuiltIns: true
					}]
				],
				presets: [
					['@babel/env', {
						loose: true,
						modules: false,
						useBuiltIns: 'entry'
					}]
				],
				sourceMaps: 'inline',
				...Object(nextConfig)
			})
		).then(
			nextConfig => Promise.all([
				normalizePlugins(
					nextConfig.plugins || [],
					normalizeBabelPluginId,
					requiredOpts
				),
				normalizePlugins(
					nextConfig.presets || [],
					normalizeBabelPresetId,
					requiredOpts
				)
			]).then(([normalizedPlugins, normalizedPresets]) => ({
				...nextConfig,
				plugins: normalizedPlugins,
				presets: normalizedPresets
			}))
		);
	},
	write(use, stats, opts) {
		// configure babel transform options
		const transformOpts = { ...use.config, babelrc: false, filename: stats.pathname, filenameRelative: path.relative(opts.dir, stats.pathname) };

		// process the source using babel
		return use.require.babel.transformAsync(stats.source, transformOpts).then(
			result => result.code
		);
	}
};

/* Uses for React
/* ========================================================================== */

const useReact = {
	...useJsx,
	config(use) {
		return touchPackageJson().then(
			() => use.readConfig('babel')
		).then(
			nextConfig => ({
				presets: [
					['@babel/preset-react', {
						useBuiltIns: true
					}],
					['@babel/env', {
						loose: true,
						modules: false,
						useBuiltIns: 'entry'
					}]
				],
				sourceMaps: 'inline',
				...Object(nextConfig)
			})
		).then(
			nextConfig => Promise.all([
				normalizePlugins(
					nextConfig.plugins || [],
					normalizeBabelPluginId,
					requiredOpts
				),
				normalizePlugins(
					nextConfig.presets || [],
					normalizeBabelPresetId,
					requiredOpts
				)
			]).then(([normalizedPlugins, normalizedPresets]) => ({
				...nextConfig,
				plugins: normalizedPlugins,
				presets: normalizedPresets
			}))
		);
	}
};

/* Export Uses
/* ========================================================================== */

export default {
	cra: [ usePostcss, useReact ],
	default: [],
	jsx: [ useJsx ],
	phtml: [ usePhtml ],
	postcss: [ usePostcss ],
	react: [ useReact ],
	standard: [ usePhtml, usePostcss, useJsx ]
};
