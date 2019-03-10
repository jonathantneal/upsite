import { execSync } from 'child_process';
import fse from 'fse';
import { generate } from 'selfsigned';
import path from 'path';

export default function trustCertificate(opts) {
	const pems = generate([
		{ name: 'commonName', value: 'localhost' },
		{ name: 'countryName', value: 'US' },
		{ shortName: 'ST', value: 'California' },
		{ name: 'localityName', value: 'Los Angeles' },
		{ name: 'organizationName', value: 'Company' }
	], {
		extensions: [
			{
				name: 'subjectAltName',
				altNames: [{
					type: 2,
					value: 'localhost'
				}, {
					type: 7,
					ip: '127.0.0.1'
				}]
			}
		]
	});

	const privateFullpath = path.resolve(__dirname, 'localhost.key');
	const certFullpath = path.resolve(__dirname, 'localhost.crt');

	fse.writeFileSync(privateFullpath, pems.private);
	fse.writeFileSync(certFullpath, pems.cert);

	const hasMessage = typeof Object(opts).isCertifyingHttps === 'string';

	if (process.platform === 'win32') {
		if (hasMessage) {
			console.log(opts.isCertifyingHttps);
		}

		exec(`certutil -addstore -user root "${certFullpath}"`);
	} else if (process.platform === 'darwin') {
		if (hasMessage) {
			console.log(opts.isCertifyingHttps);
		}

		exec(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certFullpath}`);
	}

	return {
		key: pems.private,
		cert: pems.cert
	};
}

function exec(cmd) {
	return execSync(cmd, {
		stdio: [null, null, null],
		cwd
	});
}

const cwd = process.cwd();
