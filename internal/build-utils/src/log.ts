import process from 'process'
import consola from 'consola'

// 出现错误并退出
export function errorAndExit(err: Error): never {
  consola.error(err)
  process.exit(1)
}
