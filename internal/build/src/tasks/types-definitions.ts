import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import { buildOutput } from '../../../build-utils/src'
import { pathRewriter, run } from '../utils'

// vue-tsc：这是 Vue 3 的官方工具，用于生成 TypeScript 类型定义文件。
/**
 * -p tsconfig.web.json：指定 TypeScript 配置文件。
 * --declaration：生成 .d.ts 类型定义文件。
 * --emitDeclarationOnly：只生成类型定义文件，不生成 JavaScript 文件。
 * --declarationDir dist/types：指定生成的类型定义文件的输出目录。
 */
export const generateTypesDefinitions = async () => {
  await run('npx vue-tsc -p tsconfig.web.json --declaration --emitDeclarationOnly --declarationDir dist/types')
  const typesDir = path.join(buildOutput, 'types', 'packages')
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
