export interface SealConfig {
  companyName: string
  sealType: string
  bottomText: string
  color: string
  size: number
  fontSize: number
  borderStyle: string
  centerIcon: string
  iconSize: number
  rotation: number
  textLayout: string
  lineWidth: number
  sealFont: string
}

export interface SealTemplate {
  name: string
  config: Partial<SealConfig>
}

// 默认配置
export const defaultConfig: SealConfig = {
  companyName: '示例科技有限公司',
  sealType: 'company',
  bottomText: '专用章',
  color: '#e74c3c',
  textLayout: 'semicircleText',
  size: 200,
  fontSize: 16,
  borderStyle: 'single',
  centerIcon: 'star',
  iconSize: 30,
  rotation: 0,
  lineWidth: 2,
  sealFont: '宋体'
}

export const sealFonts = [
  { value: '宋体', label: '宋体' },
  { value: 'Microsoft YaHei', label: 'Microsoft YaHei' }
]

// 中心图案
export const centerIcons = [
  { value: 'star', label: '五角星' },
  { value: 'pentagon', label: '五边形' },
  { value: 'circle', label: '圆形' },
  { value: 'square', label: '方形' },
  { value: 'none', label: '无图案' }
]
// 印章类型
export const sealTypes = [
  { value: 'company', label: '公司公章' },
  { value: 'contract', label: '合同专用章' },
  { value: 'finance', label: '财务专用章' },
  { value: 'personal', label: '个人印章' }
]

// 模板系统
export const templates: SealTemplate[] = [
  {
    name: '公司公章',
    config: {
      sealType: 'company',
      color: '#e74c3c',
      borderStyle: 'double',
      centerIcon: 'star'
    }
  },
  {
    name: '合同专用',
    config: {
      sealType: 'contract',
      color: '#3498db',
      borderStyle: 'single',
      centerIcon: 'circle'
    }
  },
  {
    name: '财务专用',
    config: {
      sealType: 'finance',
      color: '#27ae60',
      borderStyle: 'single',
      centerIcon: 'square'
    }
  },
  {
    name: '个人印章',
    config: {
      sealType: 'personal',
      color: '#9b59b6',
      borderStyle: 'single',
      centerIcon: 'none'
    }
  }
]
