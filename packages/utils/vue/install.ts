import type { App, Directive } from 'vue'
import type { SFCInstallWithContext, SFCWithInstall } from './typescript'

/**
 * 让组件同时具备 app.use() 注册能力和链式挂载子组件的能力
 * const Button = defineComponent({ name: 'ElButton' }) const ButtonGroup = defineComponent({ name: 'ElButtonGroup' })
 * export const ElButton = withInstall(Button, { ButtonGroup }) => app.use(ElButton) // 注册 ElButton 和 ElButtonGroupElButton.ButtonGroup // 也能直接访问
 * @param main 主组件
 * @param extra 可选：子组件或工具函数
 * @returns
 */
export const withInstall = <T, E extends Record<string, any>>(main: T, extra?: E) => {
  ;(main as SFCWithInstall<T>).install = (app: any): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp) // 注册所有组件
    }
  }
  // 把子组件挂到主组件上，实现链式调用
  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as any)[key] = comp
    }
  }
  // 返回增强后的主组件（带 install 和子组件）
  return main as SFCWithInstall<T> & E
}

export const withInstallFunction = <T>(fn: T, name: string) => {
  ;(fn as SFCWithInstall<T>).install = (app: App) => {
    ;(fn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = fn
  }

  return fn as SFCInstallWithContext<T>
}

export const withInstallDirective = <T extends Directive>(directive: T, name: string) => {
  ;(directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive)
  }

  return directive as SFCWithInstall<T>
}

// export const withNoopInstall = <T>(component: T) => {
//   ;(component as SFCWithInstall<T>).install = NOOP

//   return component as SFCWithInstall<T>
// }
