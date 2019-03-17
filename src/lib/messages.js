import colors from './colors';

const name = 'upsite';
const play = '→';
const note = process.platform === 'win32' ? '☼' : '⚡';

export default {
	isGettingReady: () => console.log(`${colors.yellow(note)} ${name} ${colors.dim('is getting ready')}`),
	isInstalling: id => console.log(`${colors.magenta(play)} ${name} ${colors.dim('is installing')} ${id}`),
	isNotAvailable: () => console.log(`${colors.red(note)} ${name} ${colors.dim('could not start the server')}`),
	isReady: ports => console.log(`${colors.yellow(note)} ${name} ${colors.dim('is ready at')} ${colors.green(asNormalizedPort(ports))}`),
	isTrustingHttps: () => console.log(`${colors.magenta(play)} ${name} ${colors.dim('is trusting the https certificates locally')}`)
};

function asNormalizedPort(ports) {
	return ports.filter(port => port !== 80 && port !== 443).map(
		port => `http${port === 80 ? '' : 's'}://localhost${port === 80 || port === 443 ? '' : `:${port}`}/`
	).join(' ') || 'https://localhost/';
}
