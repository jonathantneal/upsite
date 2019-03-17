import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isCli = String(process.env.NODE_ENV).includes('cli');

const input = isCli ? 'src/cli.js' : 'src/index.js';
const output = isCli ? { file: 'cli.js', format: 'cjs' } : [{ file: 'index.js', format: 'cjs' }, { file: 'index.mjs', format: 'esm' }];
const plugins = [
	babel(),
	nodeResolve(),
	commonjs(),
	json(),
	terser(),
	trimUseStrict()
].concat(isCli ? addHashBang() : [])

export default { input, output, plugins };

function trimUseStrict() {
	return {
		name: 'trim-use-strict',
		renderChunk(code) {
			return code.replace(/\s*('|")?use strict\1;\s*/, '');
		}
	};
}

function addHashBang() {
	return {
		name: 'add-hash-bang',
		renderChunk(code) {
			return `#!/usr/bin/env node\n${code}`;
		}
	};
}
