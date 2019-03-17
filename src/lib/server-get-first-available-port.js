import net from 'net';

/**
* @function getFirstAvailablePort
* @description return a promise for the first available port for a connection
* @param {Number} port - port for the connection
* @param {...Number} ignorePorts - ports to be ignored for the connection
* @return {Promise} promise for the first available port for a connection
*/

export default function getFirstAvailablePort(port) {
	let portPromise = Promise.reject();

	for (
		let currentPort = Math.min(Math.max(port, 0), 9999);
		currentPort <= 9999;
		++currentPort
	) {
		portPromise = portPromise.catch(() => isPortAvailable(currentPort));
	}

	return portPromise;
}

/**
* @function isPortAvailable
* @description return a promise for whether the port is available for a connection
* @param {Number} port - port for the connection
* @return {Promise} promise for whether the port is availale for a connection
*/

function isPortAvailable(port) {
	return new Promise((resolve, reject) => {
		const tester = net.createServer().once('error', reject).once('listening', () => {
			tester.once('close', () => resolve(port)).close();
		}).listen(port);
	});
}
