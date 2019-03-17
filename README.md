# Upsite [<img src="https://jonathantneal.github.io/node-logo.svg" alt="" width="90" height="90" align="right">][Upsite]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[Upsite] lets you start a local server without any configuration.

```bash
npx upsite
```

That’s it. Your website is up on HTTP and HTTPs. Need a trusted certificate?

```bash
npx upsite --trust
```

That’s it. Your HTTPs certificate is trusted and you won’t need to run this
command again. Need a custom port?

```bash
npx upsite --port 8080
```

That’s it. Your website is up on HTTP and HTTPs at port _8080_. Need [Babel],
[PostCSS], or [pHTML]?

```bash
npx upsite --config standard
```

That’s it. HTML, CSS, and JS files in the _public_ directory are automatically
transformed. Need to change that directory?

```bash
npx update --dir whatever
```

That’s it. Your files are served from the _whatever_ directory. Need your own
rules?

```bash
npx update --config whatever 
```

That’s it. You control the configuration from _whatever.config.js_.

```js
module.exports = {
  dir: 'www',
  uses: [
    // use js/jsx files with babel
    {
      extensions: ['js', 'jsx'],
      require: {
        babel: '@babel/core'
      },
      config: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            pragma: '$',
            pragmaFrag: '$',
            useBuiltIns: true
          }]
        ]
      },
      // transform jsx files with babel
      write: (use, stats, opts) => use.require.babel.transformAsync(
        stats.source,
        {
          ...use.config,
          babelrc: false,
          filename: stats.pathname
        }
      ).then(
        result => result.code
      )
    },
    // use svg files with svgo
		{
			extensions: ['svg'],
			require: {
				svgo: 'svgo'
			},
			// use package.json[svgo], .svgorc, .svgorc.json, .svgorc.yaml, .svgorc.yml, .svgorc.js, svgo.config.js
			config: (use) => use.readConfig('svgo'),
			// transform svg files with svgo
			write: (use, stats) => new use.require.svgo().optimize(
				stats.source,
				{
					...use.config,
					path: stats.filepath
				}
			).then(
				result => result.data
			)
		}
  ]
};
```

---

[Upsite] automatically spins up a server and lets you start writing to files.
The server includes a self-signed SSL certificate which can be trusted. Upsite
creates a `package.json` file and a `public` folder with HTML, CSS, and JS
files inside of it to get you started, but these can be changed as well.

[cli-img]: https://img.shields.io/travis/jonathantneal/upsite.svg
[cli-url]: https://travis-ci.org/jonathantneal/upsite
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[npm-img]: https://img.shields.io/npm/v/upsite.svg
[npm-url]: https://www.npmjs.com/package/upsite

[Babel]: https://github.com/babel/babel/
[Express]: http://expressjs.com/
[Express Variable]: https://github.com/jonathantneal/express-variable
[pHTML]: https://github.com/phtmlorg/phtml
[PostCSS]: https://github.com/postcss/postcss
[Upsite]: https://github.com/jonathantneal/upsite
