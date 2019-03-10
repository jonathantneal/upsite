export default {
	'standard': {
		html: {
			plugins: [
				['@phtml/doctype', {
					safe: true
				}],
				'@phtml/include',
				'@phtml/jsx',
				'@phtml/schema',
				'@phtml/self-closing'
			]
		},
		css: {
			plugins: [
				'import',
				['preset-env', {
					stage: 0
				}]
			]
		},
		js: {
			plugins: [
				['@babel/plugin-transform-react-jsx', {
					pragma: '$',
					pragmaFrag: '$',
					useBuiltIns: true
				}],
				['@babel/proposal-class-properties', {
					loose: true
				}]
			],
			presets: [
				['@babel/env', {
					loose: true,
					modules: false,
					useBuiltIns: 'entry'
				}]
			]
		},
		touch: {
			'.browserslistrc': '# browsers that we support\n\nlast 2 chrome versions\nlast 2 edge versions\nlast 2 firefox versions\nlast 2 safari versions\nlast 2 ios versions'
		}
	}
};
