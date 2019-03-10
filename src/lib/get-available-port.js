import net from 'net';

export default function getAvailablePort(portStart, portRange) {
	let portIndex = -1;

	let portPromise = Promise.reject();

	while (++portIndex < portRange) {
		const currentPort = Number(portStart) + portIndex;

		portPromise = portPromise.catch(() => isPortAvailable(currentPort));
	}

	return portPromise;
}

function isPortAvailable(port) {
	return new Promise((resolve, reject) => {
		const tester = net.createServer()
		.once('error', reject)
		.once('listening', () => {
			tester
			.once('close', () => resolve(port))
			.close();
		})
		.listen(port);
	});
}
