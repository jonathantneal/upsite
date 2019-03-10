import colors from './colors';

const name = 'upsite';
const play = process.platform === 'win32' ? '►' : '▶';
const tick = process.platform === 'win32' ? '√' : '✔';
const note = process.platform === 'win32' ? '☼' : '⚡';

export default {
	isGettingReady: `${colors.yellow(note)} ${name} ${colors.dim('is getting ready')}`,
	isInstalling: id => `${colors.yellow(play)} ${name} ${colors.dim('is installing')} ${id}`,
	isNotAvailable: `${colors.yellow(note)} ${name} ${colors.dim('could not start the server')}`,
	isReady: (httpPort, httpsPort) => `${colors.yellow(note)} ${name} ${colors.dim('is ready at')} ${colors.green(`http://localhost${asNormalPort(httpPort, 80)}/`)} ${colors.dim('and')} ${colors.green(`https://localhost${asNormalPort(httpsPort, 443)}/`)}`,
	isCertifyingHttps: `${colors.yellow(note)} ${name} ${colors.dim('is certifying https')}`,
	name,
	play,
	tick,
	note
};

function asNormalPort(port, defaultPort) {
	return port === defaultPort ? '' : `:${port}`;
}
