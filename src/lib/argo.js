const defaultOpts = {
	config: '',
	dir: 'public',
	trust: false
};

const namelessArgs = [
	'dir',
	'port',
	'config'
];

const shorthandArgs = {
	'-c': '--config',
	'-d': '--dir',
	'-p': '--port',
	'-t': '--trust'
};

const dash = /^--([^\s]+)$/;

export default Object.assign({
	port: [80, 443]
}, process.argv.slice(2).reduce(
	// eslint-disable-next-line max-params
	(object, arg, i, args) => {
		if (dash.test(getArgName(arg))) {
			// handle name/value arguments
			const argName = getArgName(arg).replace(dash, '$1');

			object[argName] = i + 1 in args
				? getInstance(argName, args[i + 1], object)
			: true;
		} else if (!dash.test(getArgName(args[i - 1]))) {
			// handle nameless value arguments
			namelessArgs.some((namelessArg, namelessIndex) => {
				if (object[namelessArg] === defaultOpts[namelessArg]) {
					object[namelessArg] = getInstance(namelessArg, arg, object);

					namelessArgs.splice(namelessIndex, 1);

					return true;
				}

				return false;
			});
		}

		return object;
	},
	{
		...defaultOpts
	}
));

function getArgName(arg) {
	return shorthandArgs[arg] || arg;
}

function getInstance(argName, arg, object) {
	const { constructor } = defaultOpts[argName] || '';

	if (argName === 'port') {
		const ports = arg.split(/,/g).map(argPort => Number(argPort));

		return object.port ? object.port.concat(ports) : ports;
	} else if (Boolean === constructor) {
		return arg !== 'false';
	} else if ([Object,Number,String].includes(constructor)) {
		return constructor(arg);
	} else {
		return new constructor(arg);
	}
}
