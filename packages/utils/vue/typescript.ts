import type { AppContext, EmitsOptions, Plugin, SetupContext } from 'vue'

// Plugin: Vue3 的插件接口，定义了 { install(app: App, ...options: any[]): void }
// T: 泛型参数
// T & Plugin: 交叉类型：新类型同时具有 T 的所有成员 以及 Plugin 的所有成员
export type SFCWithInstall<T> = T & Plugin

export type SFCInstallWithContext<T> = SFCWithInstall<T> & {
  _context: AppContext | null
}

export type EmitFn<E extends EmitsOptions> = SetupContext<E>['emit']
