/* Default */

const defaultHtmlFiledata = `<!doctype html>
<title>upsite</title>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`;
const defaultCssFiledata = ``;
const defaultJsFiledata = ``;

/* Standard */

const standardBrowserslistFiledata = `# browsers that we support

last 2 versions
not dead`;
const standardHtmlFiledata = `<title>upsite</title>
<script src="jsx.js"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`;
const standardCssFiledata = `body {
	margin-inline: 5%;
}`;
const standardJsxFiledata = `function $(node, props) {
	const element = node === $ ? document.createDocumentFragment() : node instanceof Node ? node : document.createElement(node);
	for (const prop in Object(props)) /^on/.test(prop) ? element.addEventListener(prop.slice(2), props[prop]) : e.setAttribute(prop, props[prop]);
	for (let child = Array.prototype.slice.call(arguments, 2), i = -1; ++i in child; ) element.appendChild(typeof child[i] === 'string' ? document.createTextNode(child[i]) : child[i]);
	return element;
}`
const standardJsFiledata = `document.addEventListener('DOMContentLoaded', () => {
	document.body.append(<p>Greetings, {navigator.vendor} browser!</p>)
})`;

const standardHtmlPlugins = [
	['@phtml/doctype', {
		safe: true
	}],
	'@phtml/include',
	'@phtml/jsx',
	'@phtml/schema',
	'@phtml/self-closing'
];
const standardCssPlugins = [
	'import',
	['preset-env', {
		stage: 0
	}]
];
const standardJsPlugins = [
	['@babel/plugin-transform-react-jsx', {
		pragma: '$',
		pragmaFrag: '$',
		useBuiltIns: true
	}],
	['@babel/proposal-class-properties', {
		loose: true
	}]
];
const standardJsPresets = [
	['@babel/env', {
		loose: true,
		modules: false,
		useBuiltIns: 'entry'
	}]
];

/* React */

const reactHtmlFiledata = `<title>upsite react</title>
<script src="https://unpkg.com/react@16/umd/react.development"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body><div id="root" /></body>`;

const reactJsFiledata = `document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(<>
		<h1>upsite</h1>
		<p>Greetings, {navigator.vendor} browser!</p>
	</>, document.getElementById('root'))
})`;

const reactJsPlugins = [
	['@babel/plugin-transform-react-jsx', {
		useBuiltIns: true
	}],
	['@babel/proposal-class-properties', {
		loose: true
	}]
];

/* Exports */

export default {
	'default': {
		touch: {
			'${dir}/index.html': defaultHtmlFiledata,
			'${dir}/script.js': defaultJsFiledata,
			'${dir}/style.css': defaultCssFiledata
		}
	},
	'standard': {
		html: {
			plugins: standardHtmlPlugins
		},
		css: {
			plugins: standardCssPlugins,
			map: {
				inline: true
			}
		},
		js: {
			plugins: standardJsPlugins,
			presets: standardJsPresets,
			sourceMaps: 'inline'
		},
		touch: {
			'.browserslistrc': standardBrowserslistFiledata,
			'${dir}/index.html': standardHtmlFiledata,
			'${dir}/script.js': standardJsFiledata,
			'${dir}/jsx.js': standardJsxFiledata,
			'${dir}/style.css': standardCssFiledata
		}
	},
	react: {
		html: {
			plugins: standardHtmlPlugins
		},
		css: {
			plugins: standardCssPlugins,
			map: {
				inline: true
			}
		},
		js: {
			plugins: reactJsPlugins,
			presets: standardJsPresets,
			sourceMaps: 'inline'
		},
		touch: {
			'.browserslistrc': standardBrowserslistFiledata,
			'${dir}/index.html': reactHtmlFiledata,
			'${dir}/style.css': standardCssFiledata,
			'${dir}/script.js': reactJsFiledata
		}
	}
};
