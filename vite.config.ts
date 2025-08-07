import { defineConfig } from 'vite'
import vitePluginBanner from 'vite-plugin-banner'
import vitePluginDts from 'vite-plugin-dts'
import { readFileSync } from 'fs'

export default defineConfig(async () => {
  const pkgJson = readFileSync('./package.json', 'utf-8')
  const pkg = JSON.parse(pkgJson)

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

  const external = {
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  }

  return {
    plugins: [
      vitePluginDts({
        include: ['./src'],
        outDir: './dist/types'
      }),
      vitePluginBanner({
        content: banner
      })
    ],
    build: {
      lib: {
        name: moduleName.replace(/-/g, ''),
        entry: 'src/index.ts'
      },
      rollupOptions: {
        external
      }
    }
  }
})
