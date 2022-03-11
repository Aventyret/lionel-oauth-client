import { terser } from 'rollup-plugin-terser';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import * as path from 'path';
import pkg from './package.json';

const moduleName = pkg.name.replace(/^@.*\//, '');
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

const buildConfig = ({ outputFile, format, exports = null }) => {
  const browser = !['ejs', 'cjs'].includes(format);

  const config = {
    input: 'src/index.ts',
    output: [
      {
        name: moduleName,
        file: pkg.browser,
        format,
        sourcemap: 'inline',
        banner,
      }
    ],
    plugins: [
      pluginTypescript(),
      pluginCommonjs({
        extensions: ['.js', '.ts'],
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
      }),
      pluginNodeResolve({
        browser
      })
    ]
  };
  if (exports) {
    config.output = config.output.map(output => ({
      ...output,
      exports
    }))
  }
  if (!browser) {
    config.external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
  }
  return config;
};

const browserBuildConfig = buildConfig({
  outputFile: pkg.browser,
  format: 'iife'
});
browserBuildConfig.output = [
  ...browserBuildConfig.output,
  {
    ...browserBuildConfig.output[0],
    file: pkg.browser.replace('.js', '.min.js'),
    plugins: [terser()]
  }
]

const esBuildConfig = buildConfig({
  outputFile: pkg.module,
  format: 'es',
  exports: 'named'
});

const commonJsBuildConfig = buildConfig({
  outputFile: pkg.main,
  format: 'cjs',
  exports: 'default'
});

export default [
//  browserBuildConfig,
  esBuildConfig,
//  commonJsBuildConfig
];
