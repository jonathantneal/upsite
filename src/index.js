import argo from './lib/argo';
import getAvailablePort from './lib/get-available-port';
import http from 'http';
import https from 'https';
import manageOptions from './lib/manage-options';
import msgs from './lib/messages';
import requireAs from './lib/require-as';
import touchAs from './lib/touch-as';
import trustCertificate from './lib/trust-certificate';

// notify the user that things are starting
console.log(msgs.isGettingReady);

// prepare package.json
touchAs('package.json', '{}');

// prepare express and express variable
const express = requireAs('express', { saveAs: '--save-dev' });
const expressVariable = requireAs('express-variable', { saveAs: '--save-dev' });

const app = express();

app.use(expressVariable(argo.dir, {
	onReady(opts) {
		app.use(express.static('public'));

		manageOptions(opts, argo);

		getAvailablePort(Number(argo.port === true ? 80 : argo.port) || 80).then(
			httpPort => getAvailablePort(Number(argo.ssl === true ? 443 : argo.ssl) || 443, httpPort).then(
				httpsPort => [httpPort, httpsPort]
			)
		).then(([httpPort, httpsPort]) => {
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
