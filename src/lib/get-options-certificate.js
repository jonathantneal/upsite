import { exec } from './util';
import fse from 'fse';
import msgs from './messages';
import path from 'path';
import { generate } from 'selfsigned';

const certPathname = path.resolve(__dirname, 'localhost.crt');
const keyPathname = path.resolve(__dirname, 'localhost.key');

/**
* @function getCertificate
* @return {Certificate}
*/

export default function getCertificateOpts(opts) {
	return Promise.all([
		// read the existing certificates
		fse.readFile(certPathname, 'utf8'),
		fse.readFile(keyPathname, 'utf8')
	]).then(
		([ cert, key ]) => ({ cert, key }),
		error => {
			if (error.code === 'ENOENT') {
				// generate the certificates if they do not exist
				const certs = generateCertificate(opts.trust);

				return Promise.all([
					fse.writeFile(certPathname, certs.cert),
					fse.writeFile(keyPathname, certs.key)
				]).then(() => certs);
			}

			throw error;
		}
	).then(certs => {
		// conditionally trust the certificates on the system
		if (opts.trust) {
			if (process.platform === 'win32') {
				msgs.isTrustingHttps();

				return exec(`certutil -addstore -user root "${certPathname}"`).then(() => certs);
			} else if (process.platform === 'darwin') {
				msgs.isTrustingHttps();

				return exec(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPathname}`).then(() => certs);
			}
		}

		return certs;
	});
}

/**
* @function generateCertificate
* @return {Certificate}
*/

function generateCertificate() {
	const { cert, private: key } = generate([
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

	return { cert, key };
}

/**
* @typedef {Object} Certificate
* @property {String} cert - self-signed certificate
* @property {String} key - private key of the certificate
*/
