import argo from './lib/argo';
import getAvailablePort from './lib/get-available-port';
import http from 'http';
import https from 'https';
import manageTemplateTouch from './lib/manage-template-touch';
import msgs from './lib/messages';
import normalizePlugins from './lib/normalize-plugins';
import requireAs from './lib/require-as';
import templates from './lib/templates';
import touchAs from './lib/touch-as';
import trustCertificate from './lib/trust-certificate';

// notify the user that things are starting
console.log(msgs.isGettingReady);

// prepare package.json
touchAs('package.json', '{}');

// prepare ${dir}/index.html
touchAs(`${argo.dir}/index.html`, '<!doctype html>\n<title>upsite</title>\n<script src="script.js"></script>\n<link rel="stylesheet" href="style.css">\n<body><h1>upsite</h1></body>');
touchAs(`${argo.dir}/style.css`, '');
touchAs(`${argo.dir}/script.js`, '');

// prepare express and express variable
const express = requireAs('express', { saveAs: '--save-dev' });
const expressVariable = requireAs('express-variable', { saveAs: '--save-dev' });

const app = express();

app.use(expressVariable(argo.dir, {
	onReady(opts) {
		const installedPlugins = [];
		const requiredOpts = {
			saveAs: '--save',
			onInstall(id) { console.log(msgs.isInstalling(id)) },
			onInstalled(id) { installedPlugins.push(id); }
		};

		const template = templates[argo.template] || (Object(argo.template) === argo.template ? argo.template : {});
		const templatePlugins = {
			html: Array.from(Object(template.html).plugins || []),
			css: Array.from(Object(template.css).plugins || []),
			js: Array.from(Object(template.js).plugins || [])
		};
		const templatePresets = {
			js: Array.from(Object(template.js).presets || [])
		};

		manageTemplateTouch(template);

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

		app.use(express.static('public'));

		Promise.all([
			getAvailablePort(Number(argo.port === true ? 80 : argo.port) || 80, 1000),
			getAvailablePort(Number(argo.ssl === true ? 443 : argo.ssl) || 443, 1000)
		]).then(([httpPort, httpsPort]) => {
			const pems = trustCertificate(msgs);

			http.createServer({}, app).listen(httpPort);
			https.createServer(pems, app).listen(httpsPort);

			console.log(msgs.isReady(httpPort, httpsPort));
		}, () => {
			// notify the user that a port was unavailable
			console.log(msgs.isNotAvailable);
		});
	}
}));
