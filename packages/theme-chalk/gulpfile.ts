import path from 'path'
import { Transform } from 'stream'
import chalk from 'chalk'
import { type TaskFunction, dest, parallel, series, src } from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import rename from 'gulp-rename'
import consola from 'consola'
import postcss from 'postcss'
import cssnano from 'cssnano'
import { epOutput } from '@miu-ui/build-utils'
import type Vinly from 'vinyl'

const distFolder = path.resolve(__dirname, 'dist') // __dirname: packages/theme-chalk/dist
const distBundle = path.resolve(epOutput, 'theme-chalk') // dist/miu-ui/theme-chalk

/**
 * 用来把任意一段 CSS 代码交给 cssnano 压缩并输出体积报告
 * 组件库的样式体积优化
 * @returns
 */
function compressWithCssnano() {
  const processor = postcss([
    cssnano({
      preset: [
        'default', // 启用 cssnano 的默认优化规则
        {
          // 禁止颜色值转换（如 #ffffff → #fff）
          colormin: false,
          // 禁止字体值压缩（如 font-family 优化）
          minifyFontValues: false
        }
      ]
    })
  ])
  // 返回一个 Transform 流
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const file = chunk as Vinly
      // 跳过空文件
      if (file.isNull()) {
        callback(null, file)
        return
      }
      // 拒绝流式文件
      if (file.isStream()) {
        callback(new Error('Streaming not supported'))
        return
      }
      //  读 CSS 内容 → 压缩 → 写回
      // 把文件内容变成字符串 → 交给 PostCSS/cssnano 压缩 → 结果写回 file.contents
      const cssString = file.contents!.toString()
      processor.process(cssString, { from: file.path }).then(result => {
        // 输出压缩前后体积对比（使用 consola + chalk 彩色日志）
        const name = path.basename(file.path)
        file.contents = Buffer.from(result.css)
        consola.success(`${chalk.cyan(name)}: ${chalk.yellow(cssString.length / 1000)} KB -> ${chalk.green(result.css.length / 1000)} KB`)
        callback(null, file)
      })
    }
  })
}

/**
 * 把 theme-chalk/src 目录下所有的 .scss 源文件，编译成经过「Sass → PostCSS → cssnano 压缩」的 CSS 文件，
 * 并自动给文件名加上 miu- 前缀（除了 index.scss / base.scss / display.scss），最终输出到发布目录
 * @returns
 */
function buildThemeChalk() {
  const sass = gulpSass(dartSass) // 用 Dart-Sass 作为 Sass 编译引擎。
  const noElPrefixFile = /(index|base|display)/ // 	正则：匹配到 index.scss、base.scss、display.scss 时不加 el- 前缀。
  return src(path.resolve(__dirname, 'src/*.scss'))
    .pipe(sass.sync()) // 同步编译 Sass → CSS。
    .pipe(autoprefixer({ cascade: false })) // 自动补全浏览器前缀，去掉级联缩进
    .pipe(compressWithCssnano()) // 	调用前面定义的 compressWithCssnano() 流，进行 cssnano 压缩并输出体积信息。
    .pipe(
      rename(path => {
        if (!noElPrefixFile.test(path.basename)) {
          path.basename = `miu-${path.basename}`
        }
      })
    )
    .pipe(dest(distFolder)) // 写入最终发布目录
}

/**
 *  theme-chalk/src/dark/css-vars.scss
 * @returns
 */
function buildDarkCssVars() {
  const sass = gulpSass(dartSass)
  return src(path.resolve(__dirname, 'src/dark/css-vars.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(compressWithCssnano())
    .pipe(dest(`${distFolder}/dark`))
}

/**
 * copy from packages/theme-chalk/dist to dist/miu-ui/theme-chalk
 */
export function copyThemeChalkBundle() {
  return src(`${distFolder}/**`).pipe(dest(distBundle))
}

/**
 * copy source file to packages
 */

export function copyThemeChalkSource() {
  return src(path.resolve(__dirname, 'src/**')).pipe(dest(path.resolve(distBundle, 'src')))
}

export const build: TaskFunction = parallel(copyThemeChalkSource, series(buildThemeChalk, buildDarkCssVars, copyThemeChalkBundle))

export default build
