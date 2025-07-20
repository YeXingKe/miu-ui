import path from 'path'
import { series } from 'gulp'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { epRoot, excludeFiles, pkgRoot } from '@miu-ui/build-utils'
import { generateExternal, withTaskName, writeBundles } from '../utils'
import { ElementPlusAlias } from '../plugins/element-plus-alias'
import { buildConfigEntries, target } from '../build-info'
import type { TaskFunction } from 'gulp'
// import VueMacros from 'unplugin-vue-macros/rollup'
import type { OutputOptions, Plugin } from 'rollup'

const plugins = [
  ElementPlusAlias(),
  // 为 Vue 3 提供一些尚未稳定的实验性功能，这些功能可以让开发者提前体验 Vue 的未来特性
  // VueMacros({
  //   setupComponent: false, // 提供了一种更简洁的语法来定义组件，支持在函数式组件中使用 <script setup>
  //   setupSFC: false,
  //   plugins: {
  //     // vue: vue({
  //     //   isProduction: true,
  //     //   template: {
  //     //     compilerOptions: {
  //     //       hoistStatic: false,
  //     //       cacheHandlers: false
  //     //     }
  //     //   }
  //     // })
  //     vueJsx: vueJsx()
  //   }
  // }),
  vue(),
  // 解析 node_modules 中的模块路径，帮助 Rollup 找到和解析 Node.js 风格的模块路径
  nodeResolve({
    extensions: ['.mjs', '.js', '.json', '.ts'] // 支持的文件扩展名
  }),
  // 将 CommonJS 模块转换为 ES6 模块
  commonjs(),
  // 在 Rollup 构建过程中对 JavaScript 和 TypeScript 文件进行编译和优化。
  esbuild({
    sourceMap: true,
    target,
    loaders: {
      '.vue': 'ts'
    }
  })
]

async function buildModulesComponents() {
  const input = excludeFiles(
    // 一个高性能的文件路径匹配库
    await glob(['**/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'], {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true // 是否只返回文件路径，忽略目录路径
    })
  )
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal({ full: false }), // 动态生成外部依赖
    treeshake: { moduleSideEffects: false }, // // 配置树摇优化
    onwarn(warning, warn) {
      // 去掉vue-runtime的警告
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT' || warning.message.includes('#__NO_SIDE_EFFECTS__')) {
        return // 跳过这些警告
      }
      warn(warning) // 其他警告正常显示
    }
  })

  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: config.output.path, // 多入口，file：单入口
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: epRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`
      }
    })
  )
}

async function buildModulesStyles() {
  // pkgRoot（通常是 packages 目录）下 递归查找所有组件的样式入口
  const input = excludeFiles(
    await glob('**/style/(index|css).{js,ts,vue}', {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true
    })
  )
  const bundle = await rollup({
    input,
    plugins,
    treeshake: false
  })

  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format, // 指定输出文件的模块格式
        dir: path.resolve(config.output.path, 'components'), // 指定输出文件的目录路径
        exports: module === 'cjs' ? 'named' : undefined, // 指定输出模块的导出方式
        preserveModules: true, // 保留模块结构，不将多个模块合并为一个文件
        preserveModulesRoot: epRoot, // 指定保留模块结构的根目录
        sourcemap: true,
        entryFileNames: `[name].${config.ext}` // 指定输出文件的命名模式
      }
    })
  )
}
export const buildModules: TaskFunction = series(withTaskName('buildModulesComponents', buildModulesComponents), withTaskName('buildModulesStyles', buildModulesStyles))
