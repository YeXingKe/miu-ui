export interface City {
  id: number
  spell: string // 拼音
  name: string // 名字
}

export interface Provice {
  name: string
  data: string[]
  id?: string
}
