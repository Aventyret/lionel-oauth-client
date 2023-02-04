import pluginTypescript from '@rollup/plugin-typescript'
import pluginCommonjs from '@rollup/plugin-commonjs'
import pluginNodeResolve from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import * as path from 'path'
import pkg from './package.json'

const dts = require('rollup-plugin-dts')

const production = !process.env.ROLLUP_WATCH
const moduleName = pkg.name.replace(/^@.*\//, '')
const author = pkg.author
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`

const baseConfig = {
  input: 'src/index.ts',
  output: {
    name: moduleName.replace(/-/g, ''),
    sourcemap: 'inline',
    banner
  },
  plugins: [
    pluginTypescript(),
    pluginCommonjs({
      extensions: ['.js', '.ts']
    }),
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, '.babelrc.js')
    }),
    !production && serve({ port: 3001 }),
    !production && livereload({ watch: 'dist' })
  ]
}

const external = {
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {})
}

export default [
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: pkg.module,
      format: 'es',
      exports: 'named'
    },
    plugins: [...baseConfig.plugins, pluginNodeResolve({ browser: false })],
    external
  },
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: pkg.main,
      format: 'cjs',
      exports: 'named'
    },
    plugins: [...baseConfig.plugins, pluginNodeResolve({ browser: false })],
    external
  },
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: pkg.module.replace('.ejs.js', '.d.ts'),
      format: 'es',
      exports: 'named'
    },
    plugins: [
      ...baseConfig.plugins,
      pluginNodeResolve({ browser: false }),
      dts.default()
    ],
    external
  }
]
