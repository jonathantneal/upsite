import http from 'http';
import https from 'https';
import getFirstAvailablePort from './server-get-first-available-port';

/**
* @name Server
* @class
* @extends https.Server
* @classdesc Creates a new HTTP & HTTPS Server.
* @param {Object} options - options for the server
* @param {Function} options.listener - listener for the server
* @param {Number} options.port - primary port for the connection
* @param {String} options.cert - self-signed certificate
* @param {String} options.key - private key of the certificate
* @return {Server}
*/

export default class Server extends https.Server {
	constructor(options, connectionListener) {
		super(Object.assign({ allowHTTP1: true }, options), connectionListener);

		this._tlsHandler = typeof this._events.connection === 'function'
			? this._events.connection
		: this._tlsHandler = this._events.connection[this._events.connection.length - 1];

		this.removeListener('connection', this._tlsHandler);

		this.on('connection', onConnection);

		this.timeout = 2 * 60 * 1000;
		this.allowHalfOpen = true;
		this.httpAllowHalfOpen = false;
	}

	setTimeout(msecs, callback) {
		this.timeout = msecs;

		if (callback) {
			this.on('timeout', callback);
		}
	}

	listen(ports) {
		return [].concat(ports || []).reduce(
			(promise, port) => promise.then(
				servers => getFirstAvailablePort(port).then(availablePort => {
					const server = Object.create(this);

					server.port = availablePort;

					https.Server.prototype.listen.call(server, server.port);

					return servers.concat(server);
				})
			),
			Promise.resolve([])
		);
	}
}

function onError() {}

function onConnection(socket) {
	const data = socket.read(1);

	let hasReceivedData = false;

	if (data === null) {
		socket.removeListener('error', onError);
		socket.on('error', onError);

		socket.once('readable', () => {
			onConnection.call(this, socket);
		});

		if (!hasReceivedData) {
			socket.removeListener('end', killSocket);
			socket.on('end', killSocket);
		}
	} else {
		hasReceivedData = true;

		socket.removeListener('error', onError);

		const firstByte = data[0];

		socket.unshift(data);

		if (firstByte < 32 || firstByte >= 127) {
			this._tlsHandler(socket);
		} else {
			http._connectionListener.call(this, socket);
		}
	}
}

function killSocket() {
	if (this.writable) {
		this.end();
	}
}

/**
 * @external http.Server
 * @see https://nodejs.org/api/http.html#http_class_http_server
 * @external https.Server
 * @see https://nodejs.org/api/https.html#https_class_https_server
 * @external tls.Server
 * @see https://nodejs.org/api/tls.html#tls_class_tls_server
 */
