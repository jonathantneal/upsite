module.exports = {
	presets: [
		['@babel/env', {
			loose: true,
			modules: false,
			targets: { node: 6 },
			useBuiltIns: 'entry'
		}]
	]
};
