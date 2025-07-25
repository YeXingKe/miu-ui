import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import vue from '@vitejs/plugin-vue'
// import vueJsx from '@vitejs/plugin-vue-jsx'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import { parallel } from 'gulp'
import glob from 'fast-glob'
import { camelCase, upperFirst } from 'lodash-unified'
import { PKG_BRAND_NAME, PKG_CAMELCASE_LOCAL_NAME, PKG_CAMELCASE_NAME } from '@miu-ui/build-constants'
import { epOutput, epRoot, localeRoot } from '@miu-ui/build-utils'
// import VueMacros from 'unplugin-vue-macros/rollup'
// import { version } from '../../../../packages/element-plus/version'
import { ElementPlusAlias } from '../plugins/element-plus-alias'
import { formatBundleFilename, generateExternal, withTaskName, writeBundles } from '../utils'
import { target } from '../build-info'
import type { TaskFunction } from 'gulp'

const banner = `/*! ${PKG_BRAND_NAME} v0.0.1 */\n`

async function buildFullEntry(minify: boolean) {
  const plugins = [
    ElementPlusAlias(),
    // VueMacros({
    //   setupComponent: false,
    //   setupSFC: false,
    //   plugins: {
    //     // vue: vue({
    //     //   isProduction: false
    //     // })
    //     vueJsx: vueJsx()
    //   }
    // }),
    vue(),
    nodeResolve({
      // 忽略 Vue 的 sourcemap
      // preferBuiltins: false,
      extensions: ['.mjs', '.js', '.json', '.ts']
    }),
    commonjs(),
    esbuild({
      exclude: [],
      sourceMap: minify,
      target,
      loaders: {
        '.vue': 'ts'
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      },
      treeShaking: true,
      legalComments: 'eof'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
  if (minify) {
    plugins.push(
      minifyPlugin({
        target,
        sourceMap: true
      })
    )
  }

  const bundle = await rollup({
    // // miu-ui/packages/miu-ui
    input: path.resolve(epRoot, 'index.ts'),
    plugins,
    external: await generateExternal({ full: true }),
    treeshake: true,
    onwarn(warning, warn) {
      // 去掉vue-runtime的警告
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT' || warning.message.includes('#__NO_SIDE_EFFECTS__')) {
        return // 跳过这些警告
      }
      warn(warning) // 其他警告正常显示
    }
  })
  await writeBundles(bundle, [
    {
      format: 'umd',
      file: path.resolve(epOutput, 'dist', formatBundleFilename('index.full', minify, 'js')),
      exports: 'named',
      name: PKG_CAMELCASE_NAME,
      globals: {
        vue: 'Vue'
      },
      sourcemap: minify,
      banner
    },
    {
      format: 'esm',
      file: path.resolve(epOutput, 'dist', formatBundleFilename('index.full', minify, 'mjs')),
      sourcemap: minify,
      banner
    }
  ])
}

async function buildFullLocale(minify: boolean) {
  const files = await glob(`**/*.ts`, {
    cwd: path.resolve(localeRoot, 'lang'),
    absolute: true
  })
  return Promise.all(
    files.map(async file => {
      const filename = path.basename(file, '.ts')
      const name = upperFirst(camelCase(filename))

      const bundle = await rollup({
        input: file,
        plugins: [
          esbuild({
            minify,
            sourceMap: minify,
            target
          })
        ]
      })
      await writeBundles(bundle, [
        {
          format: 'umd',
          file: path.resolve(epOutput, 'dist/locale', formatBundleFilename(filename, minify, 'js')),
          exports: 'default',
          name: `${PKG_CAMELCASE_LOCAL_NAME}${name}`,
          sourcemap: minify,
          banner
        },
        {
          format: 'esm',
          file: path.resolve(epOutput, 'dist/locale', formatBundleFilename(filename, minify, 'mjs')),
          sourcemap: minify,
          banner
        }
      ])
    })
  )
}

export const buildFull = (minify: boolean) => async () => Promise.all([buildFullEntry(minify), buildFullLocale(minify)])

export const buildFullBundle: TaskFunction = parallel(withTaskName('buildFullMinified', buildFull(true)), withTaskName('buildFull', buildFull(false)))
