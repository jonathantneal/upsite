import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isCli = String(process.env.NODE_ENV).includes('cli');

const input = isCli ? 'src/cli.js' : 'src/index.js';
const output = isCli ? { file: 'cli.js', format: 'cjs', strict: false } : [{ file: 'index.js', format: 'cjs', strict: false }, { file: 'index.mjs', format: 'esm', strict: false }];
const plugins = [
	babel(),
	nodeResolve(),
	commonjs(),
	json(),
	terser()
].concat(isCli ? addHashBang() : [])

export default { input, output, plugins };

function addHashBang() {
	return {
		name: 'add-hash-bang',
		renderChunk(code) {
			return `#!/usr/bin/env node\n${code}`;
		}
	};
}
