import fse from 'fse';
import getOptions from './lib/get-options';
import getPathStats from './lib/get-path-stats';
import msgs from './lib/messages';
import Server from './lib/server';
import { parse as parseURL } from 'url';
import { require_config } from './lib/util';

export default function upsite(rawopts) {
	getOptions(rawopts).then(opts => {
		new Server({ cert: opts.cert, key: opts.key }, requestListener).listen(opts.port).then(servers => {
			msgs.isReady(servers.map(server => server.port));
		});

		function requestListener(request, response) {
			const location = parseURL(request.url);

			return getPathStats(opts.dir, location.pathname).then(stats => {
				const isTheFileUnmodified = request.headers['if-modified-since'] === stats.lastModified;

				if (isTheFileUnmodified) {
					response.writeHead(304);

					return response.end();
				}

				if (request.method === 'HEAD') {
					response.writeHead(200, {
						'Connection': 'keep-alive',
						'Content-Length': stats.size,
						'Content-Type': stats.contentType,
						'Date': stats.date,
						'Last-Modified': stats.lastModified
					});

					return response.end();
				} else {
					if (request.method === 'GET') {
						for (const use of opts.uses) {
							if (use.extensions.includes(stats.extname)) {
								// ...
								Object.assign(stats, { location });

								// eslint-disable-next-line no-loop-func
								return fse.readFile(stats.pathname, 'utf8').then(source => {
									Object.assign(stats, { source });

									// ...
									return Promise.resolve(use.write(use, stats, opts)).then(buffer => {
										response.writeHead(200, {
											'Connection': 'keep-alive',
											'Content-Type': stats.contentType,
											'Content-Length': buffer.length,
											'Date': stats.date,
											'Last-Modified': stats.lastModified
										});

										response.write(buffer);

										response.end();
									});
								}).catch(error => {
									response.writeHead(404);

									response.write(String(Object(error).message || '') || String(error || ''));

									return response.end();
								});
							}
						}
					}

					response.writeHead(200, {
						'Connection': 'keep-alive',
						'Content-Type': stats.contentType,
						'Content-Length': stats.size,
						'Date': stats.date,
						'Last-Modified': stats.lastModified
					});

					const readStream = fse.createReadStream(stats.pathname);

					return readStream.pipe(response);
				}
			}).catch(error => {
				response.writeHead(404);
				response.write(String(Object(error).message || '') || String(error || ''));

				return response.end();
			});
		}
	}, msgs.isNotAvailable);
}

export { require_config as readConfig }
