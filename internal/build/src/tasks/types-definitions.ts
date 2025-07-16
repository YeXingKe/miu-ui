import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove, ensureDir } from 'fs-extra'
import { buildOutput, epRoot, projRoot } from '@miu-ui/build-utils'
import { pathRewriter, run } from '../utils'
import ts from 'typescript'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

// vue-tsc：这是 Vue 3 的官方工具，用于生成 TypeScript 类型定义文件。
/**
 * -p tsconfig.web.json：指定 TypeScript 配置文件。
 * --declaration：生成 .d.ts 类型定义文件。
 * --emitDeclarationOnly：只生成类型定义文件，不生成 JavaScript 文件。
 * --declarationDir dist/types：指定生成的类型定义文件的输出目录。
 */
export const generateTypesDefinitions = async () => {
  // await run('npx vue-tsc -p tsconfig.web.json --listFiles') // 测试vue-tsc编译了那些文件
  await run('npx vue-tsc -p tsconfig.web.json --declaration --emitDeclarationOnly --declarationDir dist/types') // vue-tsc命令自动创建空目录
  const typesDir = path.join(buildOutput, 'types', 'packages') // dist/types/packages
  const entryDir = path.join(typesDir, 'miu-ui') // dist/types/packages/miu-ui
  const entryFilePath = path.join(entryDir, 'index.d.ts') // dist/types/packages/miu-ui/index.d.ts
  const tsDir = path.join(projRoot, 'node_modules', 'typescript') // miu-ui/node_modules/typescript
  const tsConfigPath = path.join(projRoot, 'tsconfig.web.json') // miu-ui/tsconfig.web.json
  const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile)

  // 生成 .d.ts files
  const extractorConfig = ExtractorConfig.prepare({
    // API提取器的配置
    configObject: {
      projectFolder: typesDir, // 设置项目文件夹路径
      mainEntryPointFilePath: entryFilePath, // 设置主入口文件路径
      apiReport: {
        enabled: false // 禁用API报告生成
      },
      docModel: {
        enabled: false // 禁用文档模型生成
      },
      tsdocMetadata: {
        enabled: false // 禁用TSdoc元数据生成
      },
      dtsRollup: {
        // 启用DTS汇总，并设置未修剪的文件路径
        enabled: true,
        untrimmedFilePath: entryFilePath
      },
      compiler: {
        // 配置编译器选项，包括覆盖tsconfig.json和设置包含路径
        overrideTsconfig: {
          compilerConfig: {
            lib: tsConfig.config.compilerOptions.lib, // 继承lib配置
            paths: {
              'miu-ui': [entryFilePath],
              '@miu-ui/*': [`${typesDir}/*`]
            },
            skipLibCheck: true // 跳过库检查以提高编译速度
          },
          includes: [typesDir] // 设置编译器包含的目录
        }
      }
    },
    configObjectFullPath: undefined, // 不使用完整的配置对象路径
    packageJsonFullPath: path.join(epRoot, 'package.json') // 指定package.json文件路径
  })
  Extractor.invoke(extractorConfig, { typescriptCompilerFolder: tsDir })

  // const fileContent = await readFile(entryFilePath, 'utf8') // 读取入口文件
  // const sourceFile = ts.createSourceFile(entryFilePath, fileContent, tsConfig.config.compilerOptions.target);
  // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }) // 创建一个用于格式化ts代码的打印机实例
  // let formattedText = printer.printFile(sourceFile) // 使用打印机实例格式化给定的源文件对象
  // formattedText = `import "../utils/"`
  // 获取所有 .d.ts 文件的路径
  const filePaths = await glob(`**/*.d.ts`, {
    cwd: typesDir, // 指定匹配的根目录。
    absolute: true // 返回绝对路径。
  })
  const rewriteTasks = filePaths.map(async filePath => {
    const content = await readFile(filePath, 'utf8')
    await writeFile(filePath, pathRewriter('esm')(content), 'utf8')
  })
  await Promise.all(rewriteTasks)
  const sourceDir = path.join(typesDir, 'miu-ui')
  console.log('sourceDir====', sourceDir)
  await copy(sourceDir, typesDir) // 将源目录中的文件复制到目标目录。
  await remove(sourceDir)
}
