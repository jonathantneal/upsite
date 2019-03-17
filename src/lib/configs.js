import msgs from './messages';
import normalizePlugins, { normalizeBabelPluginId, normalizeBabelPresetId, normalizePhtmlPluginId, normalizePostcssPluginId } from './configs-normalize';
import path from 'path';

/* Default */

const defaultConfig = {
	touch: {
		'${dir}/index.html': `<!doctype html>
<title>upsite</title>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`,
		'${dir}/script.js': '',
		'${dir}/style.css': ''
	}
};

/* Standard */

const requiredOpts = {
	npmInstallOptions: '--save-dev',
	onBeforeNpmInstall: msgs.isInstalling
};

const standardConfig = {
	uses: [
		{
			extensions: ['htm', 'html', 'phtml'],
			require: {
				phtml: 'phtml'
			},
			config(use) {
				return use.readConfig('phtml').then(
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
		},
		{
			extensions: ['css', 'pcss'],
			require: {
				postcss: 'postcss'
			},
			config(use) {
				return use.readConfig('postcss').then(
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
		},
		{
			extensions: ['js', 'jsx'],
			require: {
				babel: '@babel/core'
			},
			config(use) {
				return use.readConfig('babel').then(
					nextConfig => ({
						plugins: [
							['@babel/plugin-transform-react-jsx', {
								pragma: '$',
								pragmaFrag: '$',
								useBuiltIns: true
							}],
							['@babel/proposal-class-properties', {
								loose: true
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
		}
	],
	touch: {
		'.browserslistrc': `# browsers that we support

last 2 versions
not dead`,
		'${dir}/index.html': `<title>upsite</title>
<script src="jsx.js"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`,
		'${dir}/script.js': `document.addEventListener('DOMContentLoaded', () => {
	document.body.append(<p>Greetings, {navigator.vendor} browser!</p>)
})`,
		'${dir}/jsx.js': `function $(node, props) {
	const element = node === $ ? document.createDocumentFragment() : node instanceof Node ? node : document.createElement(node);
	for (const prop in Object(props)) /^on/.test(prop) ? element.addEventListener(prop.slice(2), props[prop]) : e.setAttribute(prop, props[prop]);
	for (let child = Array.prototype.slice.call(arguments, 2), i = -1; ++i in child; ) element.appendChild(typeof child[i] === 'string' ? document.createTextNode(child[i]) : child[i]);
	return element;
}`,
		'${dir}/style.css': `body {
	margin-inline: 5%;
}`
	}
};

/* React */

const reactConfig = {
	...standardConfig,
	touch: {
		'.browserslistrc': standardConfig.touch['.browserslistrc'],
		'${dir}/index.html': `<title>upsite react</title>
<script src="https://unpkg.com/react@16/umd/react.development"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body><div id="root" /></body>`,
		'${dir}/style.css': standardConfig.touch['${dir}/style.css'],
		'${dir}/script.js': `document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(<>
		<h1>upsite</h1>
		<p>Greetings, {navigator.vendor} browser!</p>
	</>, document.getElementById('root'))
})`
	}
};

export default {
	default: defaultConfig,
	standard: standardConfig,
	react: reactConfig
};
