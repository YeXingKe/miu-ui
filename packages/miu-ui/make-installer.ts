import type { App, Plugin } from '@vue/runtime-core'
// import { INSTALLED_KEY } from '../constant/key'
import type { ConfigProviderContext } from 'element-plus'
import { provideGlobalConfig } from 'element-plus'

import { version } from './version'
// 创建一个可复用的 Vue 插件安装器，用于统一注册所有组件并处理全局配置
export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options?: ConfigProviderContext) => {
    // 把所有组件逐个 Vue.use()
    components.forEach(c => app.use(c))
    if (options) provideGlobalConfig(options, app, true)
  }

  return {
    version,
    install
  }
}
