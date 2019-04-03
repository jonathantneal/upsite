module.exports = {
	plugins: [
		['@babel/plugin-proposal-class-properties', {
			loose: true
		}]
	],
	presets: [
		['@babel/preset-env', {
			corejs: 3,
			loose: true,
			modules: false,
			targets: { node: 6 },
			useBuiltIns: 'entry'
		}]
	]
};
