import path from 'path'
import { copyFile, mkdir } from 'fs/promises'
import { copy } from 'fs-extra'
import { parallel, series } from 'gulp'
import { buildOutput, epOutput, epPackage, projRoot } from '@miu-ui/build-utils'
import { buildConfig, run, runTask, withTaskName } from './src'
import type { TaskFunction } from 'gulp'
import type { Module } from './src'

// 以异步的方式复制文件
export const copyFiles = () =>
  Promise.all([
    copyFile(epPackage, path.join(epOutput, 'package.json')),
    copyFile(path.resolve(projRoot, 'README.md'), path.resolve(epOutput, 'README.md')),
    copyFile(path.resolve(projRoot, 'typings', 'global.d.ts'), path.resolve(epOutput, 'global.d.ts'))
  ])

export const copyTypesDefinitions: TaskFunction = done => {
  const src = path.resolve(buildOutput, 'types', 'packages')
  // console.log(require.resolve(buildOutput + '/types/packages'), '---------------src')
  // 复制src文件夹放到的打包对应的文件夹内
  const copyTypes = (module: Module) => withTaskName(`copyTypes:${module}`, () => copy(src, buildConfig[module].output.path, { recursive: true }))
  // 并行执行两个复制任务
  return parallel(copyTypes('esm'), copyTypes('cjs'))(done)
}

export const copyFullStyle = async () => {
  await mkdir(path.resolve(epOutput, 'dist'), { recursive: true })
  await copyFile(path.resolve(epOutput, 'theme-chalk/index.css'), path.resolve(epOutput, 'dist/index.css'))
}

// buildModules 是 gulpfile.ts 中定义的一个任务
// series 方法的作用是确保任务按顺序执行
export default series(
  withTaskName('clean', () => run('pnpm run clean')),
  withTaskName('createOutput', () => mkdir(epOutput, { recursive: true })),

  parallel(
    runTask('buildModules'), // pnpm run start buildModules等同于gulp --require ./node_modules/@esbuild-kit/cjs-loader -f gulpfile.ts "buildModules"
    runTask('buildFullBundle'),
    runTask('generateTypesDefinitions'),
    runTask('buildHelper'),
    series(
      withTaskName('buildThemeChalk', () => run('pnpm run -C packages/theme-chalk build')),
      copyFullStyle
    )
  ),
  parallel(copyTypesDefinitions, copyFiles)
)

export * from './src'
