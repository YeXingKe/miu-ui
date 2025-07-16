export { default as zhCn } from './lang/zh-cn'
export { default as zhTw } from './lang/zh-tw'
export { default as zhHk } from './lang/zh-hk'
export { default as zhMo } from './lang/zh-mo'
export { default as en } from './lang/en'

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair
}

export type Language = {
  name: string
  el: TranslatePair
}
