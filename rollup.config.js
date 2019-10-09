import babel from 'rollup-plugin-babel';

import pkg from './package.json';

const input = 'src/index.js';

const external = ['react'];

const commonBabelConfig = {
  sourceMaps: true,
  runtimeHelpers: true,
  exclude: 'node_modules/**',
};

export default [
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    external,
    plugins: [
      babel({
        ...commonBabelConfig,
        plugins: ['@babel/plugin-transform-runtime'],
      }),
    ],
  },

  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      babel({
        ...commonBabelConfig,
        plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
      }),
    ],
  },
];
