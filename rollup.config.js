import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';

function onwarn(message) {
  const suppressed = ['UNRESOLVED_IMPORT', 'THIS_IS_UNDEFINED'];

  if (!suppressed.find(code => message.code === code)) {
    console.warn(message.message);
  }
}

const input = 'dist/index.js';
const external = id => !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');
const name = 'byteclaw.forms';

const prodPlugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  terser({
    sourcemap: true,
  }),
];

const globals = { react: 'React' };
const umdBase = {
  input,
  external: Object.keys(globals),
  output: {
    format: 'umd',
    exports: 'named',
    globals,
    name,
    sourcemap: true,
  },
  onwarn,
  plugins: [
    sourceMaps(),
    nodeResolve(),
    commonjs({
      ignoreGlobal: true,
    }),
  ],
};

const umdDevConfig = {
  ...umdBase,
  output: {
    ...umdBase.output,
    file: 'dist/forms.umd.js',
  },
  plugins: umdBase.plugins.concat(
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ),
};

const umdProdConfig = {
  ...umdBase,
  output: {
    ...umdBase.output,
    file: 'dist/forms.umd.min.js',
  },
  plugins: umdBase.plugins.concat(prodPlugins),
};

const cjsConfig = {
  input,
  external,
  output: {
    file: 'dist/forms.cjs.js',
    format: 'cjs',
    sourcemap: true,
  },
  onwarn,
  plugins: [
    sourceMaps(),
    nodeResolve(),
    commonjs({
      ignore: ['emotion', 'react'],
      ignoreGlobal: true,
    }),
  ],
};

export default [umdDevConfig, umdProdConfig, cjsConfig];
