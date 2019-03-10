import argo from './lib/argo';
import getAvailablePort from './lib/get-available-port';
import http from 'http';
import https from 'https';
import msgs from './lib/messages';
import normalizePlugins from './lib/normalize-plugins';
import requireAs from './lib/require-as';
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

		if (Object(opts.html.plugins).length) {
			normalizePlugins(
				opts.html.plugins,
				id => id.replace(/^(@(?!phtml)\/)(?!phtml)/, '$phtml-').replace(/^(?!@|phtml-)/, 'phtml-'),
				requiredOpts
			);
		}

		if (Object(opts.css.plugins).length) {
			normalizePlugins(
				opts.css.plugins,
				id => id.replace(/^(@[^\/]+\/)(?!postcss)/, '$1postcss-').replace(/^(?!@|postcss-)/, 'postcss-'),
				requiredOpts
			);
		} else {
			// supress plugin warnings
			opts.css.plugins = [() => {}];
		}

		if (Object(opts.js.plugins).length) {
			normalizePlugins(
				opts.js.plugins,
				id => id.replace(/^(@[^\/]+\/)(?!plugin)/, '$1plugin-').replace(/^(?!@|babel-plugin)/, 'babel-plugin-'),
				requiredOpts
			);
		}

		if (Object(opts.js.presets).length) {
			normalizePlugins(
				opts.js.presets,
				id => id.replace(/^(@[^\/]+\/)(?!preset)/, '$1preset-').replace(/^(?!@|babel-preset)/, 'babel-preset-'),
				requiredOpts
			);
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
