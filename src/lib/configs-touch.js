/* Touches
/* ========================================================================== */

const touchDefaultBrowserslist = `# browsers that we support

last 2 versions
not dead`;

const touchDefaultIndexHtml = `<!doctype html>
<title>upsite</title>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`;

const touchDefaultStyleCss = `body {
	margin-left: 5%;
	margin-right: 5%;
}`;

const touchDefaultScriptJs = `document.addEventListener('DOMContentLoaded', function () {
	document.body.appendChild(
		document.createElement('p')
	).appendChild(
		document.createTextNode('Greetings, ' + navigator.vendor + ' browser!')
	);
})`;

const touchDefault = {
	'${dir}/index.html': touchDefaultIndexHtml,
	'${dir}/script.js': touchDefaultScriptJs,
	'${dir}/style.css': touchDefaultStyleCss
};

/* Touches for Phtml
/* ========================================================================== */

const touchPhtmlIndexHtml = `<title>upsite with phtml</title>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite with phtml</h1>
</body>`;

const touchPhtml = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchPhtmlIndexHtml,
	'${dir}/script.js': touchDefaultScriptJs,
	'${dir}/style.css': touchDefaultStyleCss
};

/* Touches for PostCSS
/* ========================================================================== */

const touchPostcssIndexHtml = `<!doctype html>
<title>upsite with postcss</title>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite with postcss</h1>
</body>`;

const touchPostcssStyleCss = `body {
	margin-inline: 5%;
}`;

const touchPostcss = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchPostcssIndexHtml,
	'${dir}/script.js': touchDefaultScriptJs,
	'${dir}/style.css': touchPostcssStyleCss
};

/* Touches for JSX
/* ========================================================================== */

const touchJsxIndexHtml = `<!doctype html>
<title>upsite with jsx</title>
<script src="jsx.js"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite with jsx</h1>
</body>`;

const touchJsxJsxJs = `function $(node, props) {
	const element = node === $ ? document.createDocumentFragment() : node instanceof Node ? node : document.createElement(node);
	for (const prop in Object(props)) /^on/.test(prop) ? element.addEventListener(prop.slice(2), props[prop]) : e.setAttribute(prop, props[prop]);
	for (let child = Array.prototype.slice.call(arguments, 2), i = -1; ++i in child; ) element.appendChild(typeof child[i] === 'string' ? document.createTextNode(child[i]) : child[i]);
	return element;
}`;

const touchJsxScriptJs = `document.addEventListener('DOMContentLoaded', () => {
	document.body.append(<p>Greetings, {navigator.vendor} browser!</p>)
})`;

const touchJsx = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchJsxIndexHtml,
	'${dir}/jsx.js': touchJsxJsxJs,
	'${dir}/script.js': touchJsxScriptJs,
	'${dir}/style.css': touchDefaultStyleCss
};

/* Touches for React
/* ========================================================================== */

const touchReactIndexHtml = `<!doctype html>
<title>upsite with react</title>
<script src="https://unpkg.com/react@16/umd/react.development"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body><div id="root" /></body>`;

const touchReactScriptJs = `document.addEventListener('DOMContentLoaded', () => {
	ReactDOM.render(<>
		<h1>upsite</h1>
		<p>Greetings, {navigator.vendor} browser!</p>
	</>, document.getElementById('root'))
})`;

const touchReact = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchReactIndexHtml,
	'${dir}/script.js': touchReactScriptJs,
	'${dir}/style.css': touchDefaultStyleCss
};

/* Touches for CRA
/* ========================================================================== */

const touchCra = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchReactIndexHtml,
	'${dir}/script.js': touchReactScriptJs,
	'${dir}/style.css': touchPostcssStyleCss
};

/* Touches for Standard
/* ========================================================================== */

const touchStandardIndexHtml = `<title>upsite</title>
<script src="jsx.js"></script>
<script src="script.js"></script>
<link rel="stylesheet" href="style.css">
<body>
	<h1>upsite</h1>
</body>`;

const touchStandard = {
	'.browserslist': touchDefaultBrowserslist,
	'${dir}/index.html': touchStandardIndexHtml,
	'${dir}/jsx.js': touchJsxJsxJs,
	'${dir}/script.js': touchJsxScriptJs,
	'${dir}/style.css': touchPostcssStyleCss
};

/* Export Touches
/* ========================================================================== */

export default {
	cra: touchCra,
	default: touchDefault,
	jsx: touchJsx,
	phtml: touchPhtml,
	postcss: touchPostcss,
	react: touchReact,
	standard: touchStandard
};
