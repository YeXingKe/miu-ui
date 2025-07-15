import { withInstall } from '@miu-ui/utils'
import MiuChooseCity from './src/index.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const ElButton: SFCWithInstall<typeof MiuChooseCity> = withInstall(MiuChooseCity)

export default MiuChooseCity

// export * from './src/button'
// export * from './src/constants'
// export type { ButtonInstance, ButtonGroupInstance } from './src/instance'
