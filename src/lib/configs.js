import touch from './configs-touch';
import uses from './configs-uses';

export default {
	cra: {
		uses: uses.cra,
		touch: touch.cra
	},
	default: {
		uses: uses.default,
		touch: touch.default
	},
	empty: {
		uses: uses.empty,
		touch: touch.empty
	},
	jsx: {
		uses: uses.jsx,
		touch: touch.jsx
	},
	phtml: {
		uses: uses.phtml,
		touch: touch.phtml
	},
	postcss: {
		uses: uses.postcss,
		touch: touch.postcss
	},
	react: {
		uses: uses.react,
		touch: touch.react
	},
	standard: {
		uses: uses.standard,
		touch: touch.standard
	}
};
