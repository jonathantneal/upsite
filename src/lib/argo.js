const defaultOpts = {
	config: 'site',
	dir: 'public',
	port: '80',
	ssl: '',
	template: ''
};

const namelessArgs = [
	'dir',
	'port',
	'template'
];

const shorthandArgs = {
	'-c': '--config',
	'-d': '--dir',
	'-p': '--port',
	'-s': '--ssl',
	'-t': '--template'
};

export default process.argv.slice(2).reduce(
	// eslint-disable-next-line max-params
	(object, arg, i, args) => {
		const dash = /^--([^\s]+)$/;

		if (dash.test(getArgName(arg))) {
			object[getArgName(arg).replace(dash, '$1')] = i + 1 in args ? args[i + 1] : true;
		} else if (!dash.test(getArgName(args[i - 1]))) {
			namelessArgs.some((namelessArg, namelessIndex) => {
				if (object[namelessArg] === defaultOpts[namelessArg]) {
					object[namelessArg] = arg;

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
);

function getArgName(arg) {
	return shorthandArgs[arg] || arg;
}
