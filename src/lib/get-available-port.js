import net from 'net';

export default function getAvailablePort(portStart, skippedPort) {
	let portIndex = -1;

	let portPromise = Promise.reject();

	const maxPort = 9999 - portStart;

	while (++portIndex < maxPort) {
		const currentPort = Number(portStart) + portIndex;

		portPromise = portPromise.catch(() => isPortAvailable(currentPort, skippedPort));
	}

	return portPromise;
}

function isPortAvailable(port, skippedPort) {
	return port === skippedPort
		? Promise.reject()
	: new Promise((resolve, reject) => {
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
