import getCertificateOpts from './get-options-certificate';
import getConfigOpts from './get-options-config';
import path from 'path';
import { cwd } from './util';
import { require_config } from './util';

export default function getOptions(rawopts) {
	const initialOpts = {
		...Object(rawopts),
		dir: path.resolve(cwd, Object(rawopts).dir || ''),
		cwd
	};
	const cache = {};
	const configName = initialOpts.config = initialOpts.config || 'default';

	return require_config(configName).then(
		initialConfig => Promise.all([
			getConfigOpts(initialOpts, initialConfig, cache),
			getCertificateOpts(initialOpts)
		])
	).then(
		([ configOpts, certificateOpts ]) => ({
			...configOpts,
			...certificateOpts
		})
	);
}
