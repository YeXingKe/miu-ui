import type ChooseCity from './choose-city.vue'
import { CascaderProps } from 'element-plus'

export type ShowTypes = 'popover' | 'select'


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

export interface ProviceAndCityData {
  code: string,
  name: string,
  children?: Array<ProviceAndCityData>
}

export interface ChooseCityProps extends CascaderProps {
  selectedValue: string
}

export type ChooseCityInstance = InstanceType<typeof ChooseCity> & unknown
